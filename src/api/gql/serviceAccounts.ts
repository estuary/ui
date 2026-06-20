import type { ServiceAccount } from 'src/gql-types/graphql';

import { useCallback, useMemo } from 'react';

import { useMutation, useQuery } from 'urql';

import { graphql } from 'src/gql-types';

const DEFAULT_SERVICE_ACCOUNTS: ServiceAccount[] = [];

export const SERVICE_ACCOUNTS_PAGE_SIZE = 10;

const SERVICE_ACCOUNTS_QUERY = graphql(`
    query ServiceAccounts($first: Int, $after: String) {
        serviceAccounts(first: $first, after: $after) {
            edges {
                node {
                    catalogName
                    createdAt
                    createdBy
                    updatedAt
                    lastUsedAt
                    tokens {
                        id
                        detail
                        createdAt
                        createdBy
                        expiresAt
                        lastUsedAt
                    }
                }
                cursor
            }
            pageInfo {
                ...PageInfoFields
            }
        }
    }
`);

export function useServiceAccounts(afterCursor?: string) {
    const [{ fetching, data, error }] = useQuery({
        query: SERVICE_ACCOUNTS_QUERY,
        variables: {
            first: SERVICE_ACCOUNTS_PAGE_SIZE,
            after: afterCursor,
        },
    });

    const serviceAccounts = useMemo(
        () =>
            data?.serviceAccounts?.edges?.map((edge) => edge.node) ??
            DEFAULT_SERVICE_ACCOUNTS,
        [data]
    );

    const pageInfo = data?.serviceAccounts?.pageInfo ?? null;

    return {
        serviceAccounts,
        fetching,
        error,
        pageInfo,
        pageSize: SERVICE_ACCOUNTS_PAGE_SIZE,
    };
}

// The schema exposes service accounts only as a paginated connection — there is
// no by-name lookup yet. The detail page loads a generous page and finds the
// account client-side, which is fine for realistic account counts. A dedicated
// `serviceAccount(catalogName)` field would make this an O(1) fetch.
const SERVICE_ACCOUNT_LOOKUP_LIMIT = 250;

export function useServiceAccount(catalogName: string | null) {
    const [{ fetching, data, error }, reexecuteQuery] = useQuery({
        query: SERVICE_ACCOUNTS_QUERY,
        variables: { first: SERVICE_ACCOUNT_LOOKUP_LIMIT },
        pause: !catalogName,
    });

    const serviceAccount = useMemo(
        () =>
            catalogName
                ? (data?.serviceAccounts?.edges
                      ?.map((edge) => edge.node)
                      .find((node) => node.catalogName === catalogName) ?? null)
                : null,
        [data, catalogName]
    );

    // Token mutations don't return the ServiceAccount type, so URQL won't
    // invalidate this query automatically — callers refetch after minting or
    // revoking a key.
    const refetch = useCallback(
        () => reexecuteQuery({ requestPolicy: 'network-only' }),
        [reexecuteQuery]
    );

    return { serviceAccount, fetching, error, refetch };
}

// A service account is homed at `catalogName` (its management anchor) and
// seeded with one or more grants, each granting a capability on a prefix.
const CREATE_SERVICE_ACCOUNT = graphql(`
    mutation CreateServiceAccount(
        $catalogName: Name!
        $grants: [ServiceAccountGrantInput!]!
    ) {
        createServiceAccount(catalogName: $catalogName, grants: $grants) {
            catalogName
            createdAt
            createdBy
        }
    }
`);

// Mints a credential (refresh token) owned by the account. The secret is
// returned exactly once and cannot be retrieved again.
const CREATE_SERVICE_ACCOUNT_TOKEN = graphql(`
    mutation CreateServiceAccountToken(
        $catalogName: Name!
        $detail: String!
        $validFor: String!
    ) {
        createServiceAccountToken(
            catalogName: $catalogName
            detail: $detail
            validFor: $validFor
        ) {
            id
            secret
        }
    }
`);

const REVOKE_SERVICE_ACCOUNT_TOKEN = graphql(`
    mutation RevokeServiceAccountToken($id: Id!) {
        revokeServiceAccountToken(id: $id)
    }
`);

// Grants a capability on a prefix to an existing account. Re-adding a prefix
// the account already has updates its capability, so this also backs the
// "edit capability" action.
const ADD_SERVICE_ACCOUNT_GRANT = graphql(`
    mutation AddServiceAccountGrant(
        $catalogName: Name!
        $prefix: Prefix!
        $capability: Capability!
    ) {
        addServiceAccountGrant(
            catalogName: $catalogName
            prefix: $prefix
            capability: $capability
        )
    }
`);

const REMOVE_SERVICE_ACCOUNT_GRANT = graphql(`
    mutation RemoveServiceAccountGrant($catalogName: Name!, $prefix: Prefix!) {
        removeServiceAccountGrant(catalogName: $catalogName, prefix: $prefix)
    }
`);

export function useCreateServiceAccount() {
    return useMutation(CREATE_SERVICE_ACCOUNT);
}

export function useCreateServiceAccountToken() {
    return useMutation(CREATE_SERVICE_ACCOUNT_TOKEN);
}

export function useRevokeServiceAccountToken() {
    return useMutation(REVOKE_SERVICE_ACCOUNT_TOKEN);
}

export function useAddServiceAccountGrant() {
    return useMutation(ADD_SERVICE_ACCOUNT_GRANT);
}

export function useRemoveServiceAccountGrant() {
    return useMutation(REMOVE_SERVICE_ACCOUNT_GRANT);
}
