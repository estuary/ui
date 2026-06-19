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
                    id
                    displayName
                    prefix
                    capability
                    createdBy
                    createdAt
                    updatedAt
                    disabledAt
                    lastUsedAt
                    apiKeys {
                        id
                        label
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
    const [{ fetching, data, error }, reexecute] = useQuery({
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
        reexecute,
    };
}

export const CREATE_SERVICE_ACCOUNT = graphql(`
    mutation CreateServiceAccount(
        $prefix: Prefix!
        $capability: Capability!
        $displayName: String!
    ) {
        createServiceAccount(
            prefix: $prefix
            capability: $capability
            displayName: $displayName
        ) {
            id
            displayName
            prefix
            capability
            createdAt
            createdBy
        }
    }
`);

export const DISABLE_SERVICE_ACCOUNT = graphql(`
    mutation DisableServiceAccount($id: UUID!) {
        disableServiceAccount(id: $id)
    }
`);

export const ENABLE_SERVICE_ACCOUNT = graphql(`
    mutation EnableServiceAccount($id: UUID!) {
        enableServiceAccount(id: $id)
    }
`);

export const CREATE_API_KEY = graphql(`
    mutation CreateApiKey(
        $serviceAccountId: UUID!
        $label: String!
        $validFor: String!
    ) {
        createApiKey(
            serviceAccountId: $serviceAccountId
            label: $label
            validFor: $validFor
        ) {
            id
            secret
        }
    }
`);

export const REVOKE_API_KEY = graphql(`
    mutation RevokeApiKey($id: Id!) {
        revokeApiKey(id: $id)
    }
`);

export function useCreateServiceAccount() {
    return useMutation(CREATE_SERVICE_ACCOUNT);
}

export function useDisableServiceAccount() {
    return useMutation(DISABLE_SERVICE_ACCOUNT);
}

export function useEnableServiceAccount() {
    return useMutation(ENABLE_SERVICE_ACCOUNT);
}

export function useCreateApiKey() {
    return useMutation(CREATE_API_KEY);
}

export function useRevokeApiKey() {
    return useMutation(REVOKE_API_KEY);
}
