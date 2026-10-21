import type { ServiceAccount } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { useMutation, useQuery } from 'urql';

import { graphql } from 'src/gql-types';

const DEFAULT_SERVICE_ACCOUNTS: ServiceAccount[] = [];

const SERVICE_ACCOUNTS_LIMIT = 100;

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

const SERVICE_ACCOUNT_QUERY = graphql(`
    query ServiceAccount($catalogName: Name!) {
        serviceAccount(catalogName: $catalogName) {
            ...ServiceAccountFields
        }
    }
`);

export function useServiceAccount(catalogName: string | null) {
    const [{ fetching, data, error }] = useQuery({
        query: SERVICE_ACCOUNT_QUERY,
        variables: { catalogName: catalogName ?? '' },
        pause: !catalogName,
    });

    const serviceAccount = catalogName ? (data?.serviceAccount ?? null) : null;

    return { serviceAccount, fetching, error };
}

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
