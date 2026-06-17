import type { RefreshTokenInfo } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { useMutation, useQuery } from 'urql';

import { graphql } from 'src/gql-types';

const DEFAULT_TOKENS: RefreshTokenInfo[] = [];

const REFRESH_TOKENS_PAGE_SIZE = 10;

const REFRESH_TOKENS_QUERY = graphql(`
    query RefreshTokens($first: Int, $after: String) {
        refreshTokens(first: $first, after: $after) {
            edges {
                node {
                    id
                    detail
                    createdAt
                    multiUse
                    updatedAt
                    uses
                    expired
                }
                cursor
            }
            pageInfo {
                ...PageInfoFields
            }
        }
    }
`);

export function useRefreshTokens(afterCursor?: string) {
    const [{ fetching, data, error }] = useQuery({
        query: REFRESH_TOKENS_QUERY,
        variables: {
            first: REFRESH_TOKENS_PAGE_SIZE,
            after: afterCursor,
        },
    });

    const refreshTokens = useMemo(
        () =>
            data?.refreshTokens?.edges?.map((edge) => edge.node) ??
            DEFAULT_TOKENS,
        [data]
    );

    const pageInfo = data?.refreshTokens?.pageInfo ?? null;

    return {
        refreshTokens,
        fetching,
        error,
        pageInfo,
        pageSize: REFRESH_TOKENS_PAGE_SIZE,
    };
}

const CREATE_REFRESH_TOKEN = graphql(`
    mutation CreateRefreshToken(
        $detail: String
        $multiUse: Boolean!
        $validFor: String!
    ) {
        createRefreshToken(
            detail: $detail
            multiUse: $multiUse
            validFor: $validFor
        ) {
            id
            secret
        }
    }
`);

const REVOKE_REFRESH_TOKEN = graphql(`
    mutation RevokeRefreshToken($id: Id!) {
        revokeRefreshToken(id: $id)
    }
`);

export function useCreateRefreshToken() {
    return useMutation(CREATE_REFRESH_TOKEN);
}

export function useRevokeRefreshToken() {
    return useMutation(REVOKE_REFRESH_TOKEN);
}
