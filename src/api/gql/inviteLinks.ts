import { useMemo } from 'react';

import { useQuery } from 'urql';

import { graphql } from 'src/gql-types';

const DEFAULT_LINKS: any[] = [];

export const INVITE_LINKS_PAGE_SIZE = 10;

const INVITE_LINKS_QUERY = graphql(`
    query InviteLinks($first: Int, $after: String) {
        inviteLinks(first: $first, after: $after) {
            edges {
                node {
                    token
                    ssoProviderId
                    catalogPrefix
                    capability
                    singleUse
                    detail
                    createdAt
                }
                cursor
            }
            pageInfo {
                ...PageInfoFields
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
        () =>
            data?.inviteLinks?.edges?.map((edge) => edge.node) ?? DEFAULT_LINKS,
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

// The capability is interpolated as an unquoted GraphQL enum literal in a
// fixed per-value mutation rather than passed as a `$capability: Capability!`
// variable. This keeps the query string from referring to the `Capability`
// enum type by name, so a backend rename of the type cannot break parsing.
const CREATE_INVITE_LINK_ADMIN = graphql(`
    mutation CreateInviteLinkAdmin(
        $catalogPrefix: Prefix!
        $singleUse: Boolean!
        $detail: String
    ) {
        createInviteLink(
            catalogPrefix: $catalogPrefix
            capability: admin
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

const CREATE_INVITE_LINK_READ = graphql(`
    mutation CreateInviteLinkRead(
        $catalogPrefix: Prefix!
        $singleUse: Boolean!
        $detail: String
    ) {
        createInviteLink(
            catalogPrefix: $catalogPrefix
            capability: read
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

const CREATE_INVITE_LINK_WRITE = graphql(`
    mutation CreateInviteLinkWrite(
        $catalogPrefix: Prefix!
        $singleUse: Boolean!
        $detail: String
    ) {
        createInviteLink(
            catalogPrefix: $catalogPrefix
            capability: write
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

export const CREATE_INVITE_LINK_BY_CAPABILITY = {
    admin: CREATE_INVITE_LINK_ADMIN,
    read: CREATE_INVITE_LINK_READ,
    write: CREATE_INVITE_LINK_WRITE,
} as const;

export type CreateInviteLinkCapability =
    keyof typeof CREATE_INVITE_LINK_BY_CAPABILITY;

export function isCreateInviteLinkCapability(
    value: unknown
): value is CreateInviteLinkCapability {
    return (
        value === 'admin' ||
        value === 'read' ||
        value === 'write'
    );
}

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
