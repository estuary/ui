import { useEffect, useMemo } from 'react';

import { useMutation, useQuery } from 'urql';

import { graphql } from 'src/gql-types';

export const INVITE_LINKS_QUERY = graphql(`
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
export function useInviteLinks(catalogPrefix: string, refreshKey: number) {
    const [{ fetching, data, error }, reexecuteQuery] = useQuery({
        query: INVITE_LINKS_QUERY,
        variables: { catalogPrefix, first: 50 },
        pause: !catalogPrefix,
        requestPolicy: 'network-only',
    });

    // Re-fetch when refreshKey changes (after creating a new invite link)
    useEffect(() => {
        if (refreshKey > 0) {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }
    }, [refreshKey, reexecuteQuery]);

    const inviteLinks = useMemo(
        () => data?.inviteLinks?.edges?.map((edge) => edge.node) ?? [],
        [data]
    );

    return {
        inviteLinks,
        fetching,
        error,
        refetch: () => reexecuteQuery({ requestPolicy: 'network-only' }),
    };
}

export function useCreateInviteLink() {
    return useMutation(CREATE_INVITE_LINK);
}

export function useDeleteInviteLink() {
    return useMutation(DELETE_INVITE_LINK);
}

export const REDEEM_INVITE_LINK = graphql(`
    mutation RedeemInviteLink($token: UUID!) {
        redeemInviteLink(token: $token) {
            capability
            catalogPrefix
        }
    }
`);

export function useRedeemInviteLink() {
    return useMutation(REDEEM_INVITE_LINK);
}
