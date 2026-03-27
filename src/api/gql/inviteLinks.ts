import { useMemo } from 'react';

import { useQuery } from 'urql';

import { graphql } from 'src/gql-types';

export const INVITE_LINKS_PAGE_SIZE = 10;

const INVITE_LINKS_QUERY = graphql(`
    query InviteLinks($first: Int, $after: String) {
        inviteLinks(first: $first, after: $after) {
            edges {
                node {
                    token
                    catalogPrefix
                    capability
                    singleUse
                    detail
                    createdAt
                }
                cursor
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
            }
        }
    }
`);

export function useInviteLinks(afterCursor?: string) {
    const [{ fetching, data, error }] = useQuery({
        query: INVITE_LINKS_QUERY,
        variables: {
            first: INVITE_LINKS_PAGE_SIZE,
            after: afterCursor,
        },
    });

    const inviteLinks = useMemo(
        () => data?.inviteLinks?.edges?.map((edge) => edge.node) ?? [],
        [data]
    );

    const pageInfo = data?.inviteLinks?.pageInfo ?? null;

    return {
        inviteLinks,
        fetching,
        error,
        pageInfo,
        pageSize: INVITE_LINKS_PAGE_SIZE,
    };
}

export const CREATE_INVITE_LINK = graphql(`
    mutation CreateInviteLink(
        $catalogPrefix: Prefix!
        $capability: Capability!
        $singleUse: Boolean!
        $detail: String
    ) {
        createInviteLink(
            catalogPrefix: $catalogPrefix
            capability: $capability
            singleUse: $singleUse
            detail: $detail
        ) {
            token
            catalogPrefix
            capability
            singleUse
            detail
            createdAt
        }
    }
`);

export const DELETE_INVITE_LINK = graphql(`
    mutation DeleteInviteLink($token: UUID!) {
        deleteInviteLink(token: $token)
    }
`);

export const REDEEM_INVITE_LINK = graphql(`
    mutation RedeemInviteLink($token: UUID!) {
        redeemInviteLink(token: $token) {
            capability
            catalogPrefix
        }
    }
`);
