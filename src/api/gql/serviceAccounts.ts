import type { ServiceAccount } from 'src/gql-types/graphql';

import { useMemo } from 'react';

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

export function useCreateServiceAccount() {
    return useMutation(CREATE_SERVICE_ACCOUNT);
}

export function useCreateServiceAccountToken() {
    return useMutation(CREATE_SERVICE_ACCOUNT_TOKEN);
}

export function useRevokeServiceAccountToken() {
    return useMutation(REVOKE_SERVICE_ACCOUNT_TOKEN);
}
