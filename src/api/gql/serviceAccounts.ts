import type { ServiceAccount } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { useMutation, useQuery } from 'urql';

import { graphql } from 'src/gql-types';

const DEFAULT_SERVICE_ACCOUNTS: ServiceAccount[] = [];

// Service accounts are few per tenant in practice, so the list fetches a single
// generous page and shows them all.
const SERVICE_ACCOUNTS_LIMIT = 100;

// The ServiceAccount fields every query and entity-returning mutation selects.
// Mutations return the updated account, so the normalized cache (keyed by
// catalogName) reconciles the list and detail views without a refetch.
export const SERVICE_ACCOUNT_FRAGMENT = graphql(`
    fragment ServiceAccountFields on ServiceAccount {
        catalogName
        createdAt
        createdByEmail
        lastUsedAt
        grants {
            prefix
            capability
            createdAt
            detail
            updatedAt
        }
        apiKeys {
            id
            detail
            createdAt
            createdByEmail
            expiresAt
            lastUsedAt
        }
    }
`);

const SERVICE_ACCOUNTS_QUERY = graphql(`
    query ServiceAccounts($first: Int) {
        serviceAccounts(first: $first) {
            edges {
                node {
                    ...ServiceAccountFields
                }
            }
        }
    }
`);

export function useServiceAccounts() {
    const [{ fetching, data, error }] = useQuery({
        query: SERVICE_ACCOUNTS_QUERY,
        variables: { first: SERVICE_ACCOUNTS_LIMIT },
    });

    const serviceAccounts = useMemo(
        () =>
            data?.serviceAccounts?.edges?.map((edge) => edge.node) ??
            DEFAULT_SERVICE_ACCOUNTS,
        [data]
    );

    return { serviceAccounts, fetching, error };
}

// The schema exposes service accounts only as a paginated connection — there is
// no by-name lookup yet. The detail page loads a generous page and finds the
// account client-side, which is fine for realistic account counts. A dedicated
// `serviceAccount(catalogName)` field would make this an O(1) fetch.
const SERVICE_ACCOUNT_LOOKUP_LIMIT = 250;

export function useServiceAccount(catalogName: string | null) {
    const [{ fetching, data, error }] = useQuery({
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

    return { serviceAccount, fetching, error };
}

// A service account is homed at `catalogName` (its management anchor) and
// seeded with one or more grants, each granting a capability on a prefix.
const CREATE_SERVICE_ACCOUNT = graphql(`
    mutation CreateServiceAccount(
        $catalogName: Name!
        $grants: [UserGrantInput!]!
    ) {
        createServiceAccount(catalogName: $catalogName, grants: $grants) {
            catalogName
            createdAt
        }
    }
`);

// Mints an API key (a multi-use refresh token) owned by the account. The secret
// is returned exactly once and cannot be retrieved again.
const CREATE_API_KEY = graphql(`
    mutation CreateApiKey(
        $catalogName: Name!
        $detail: String!
        $validFor: String!
    ) {
        createApiKey(
            catalogName: $catalogName
            detail: $detail
            validFor: $validFor
        ) {
            id
            secret
            serviceAccount {
                ...ServiceAccountFields
            }
        }
    }
`);

const REVOKE_API_KEY = graphql(`
    mutation RevokeApiKey($id: Id!) {
        revokeApiKey(id: $id) {
            ...ServiceAccountFields
        }
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
        ) {
            ...ServiceAccountFields
        }
    }
`);

const REMOVE_SERVICE_ACCOUNT_GRANT = graphql(`
    mutation RemoveServiceAccountGrant($catalogName: Name!, $prefix: Prefix!) {
        removeServiceAccountGrant(catalogName: $catalogName, prefix: $prefix) {
            ...ServiceAccountFields
        }
    }
`);

// Revokes every active API key the account owns. Used when removing an
// account's last grant: a credential with no access left is worth retiring.
const REVOKE_ALL_API_KEYS = graphql(`
    mutation RevokeAllApiKeys($catalogName: Name!) {
        revokeAllApiKeys(catalogName: $catalogName) {
            ...ServiceAccountFields
        }
    }
`);

export function useCreateServiceAccount() {
    return useMutation(CREATE_SERVICE_ACCOUNT);
}

export function useCreateApiKey() {
    return useMutation(CREATE_API_KEY);
}

export function useRevokeApiKey() {
    return useMutation(REVOKE_API_KEY);
}

export function useAddServiceAccountGrant() {
    return useMutation(ADD_SERVICE_ACCOUNT_GRANT);
}

export function useRemoveServiceAccountGrant() {
    return useMutation(REMOVE_SERVICE_ACCOUNT_GRANT);
}

export function useRevokeAllApiKeys() {
    return useMutation(REVOKE_ALL_API_KEYS);
}
