/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query InviteLinks($first: Int, $after: String) {\n        inviteLinks(first: $first, after: $after) {\n            edges {\n                node {\n                    token\n                    catalogPrefix\n                    capability\n                    singleUse\n                    detail\n                    createdAt\n                }\n                cursor\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n": typeof types.InviteLinksDocument,
    "\n    mutation CreateInviteLink(\n        $catalogPrefix: Prefix!\n        $capability: Capability!\n        $singleUse: Boolean!\n        $detail: String\n    ) {\n        createInviteLink(\n            catalogPrefix: $catalogPrefix\n            capability: $capability\n            singleUse: $singleUse\n            detail: $detail\n        ) {\n            token\n            catalogPrefix\n            capability\n            singleUse\n            detail\n            createdAt\n        }\n    }\n": typeof types.CreateInviteLinkDocument,
    "\n    mutation DeleteInviteLink($token: UUID!) {\n        deleteInviteLink(token: $token)\n    }\n": typeof types.DeleteInviteLinkDocument,
    "\n    mutation RedeemInviteLink($token: UUID!) {\n        redeemInviteLink(token: $token) {\n            capability\n            catalogPrefix\n        }\n    }\n": typeof types.RedeemInviteLinkDocument,
    "\n    query AlertingOverviewQuery($prefix: String!, $active: Boolean) {\n        alerts(by: { prefix: $prefix, active: $active }) {\n            edges {\n                node {\n                    alertType\n                    firedAt\n                    catalogName\n                    alertDetails: arguments\n                    resolvedAt\n                }\n            }\n        }\n    }\n": typeof types.AlertingOverviewQueryDocument,
    "\n    query ActiveAlertCount($catalogName: Name!) {\n        liveSpecs(by: { names: [$catalogName] }) {\n            edges {\n                cursor\n                node {\n                    activeAlerts {\n                        alertType\n                    }\n                }\n            }\n        }\n    }\n": typeof types.ActiveAlertCountDocument,
    "\n    query ActiveAlertsQuery($catalogName: [Name!]) {\n        liveSpecs(by: { names: $catalogName }) {\n            edges {\n                node {\n                    activeAlerts {\n                        alertType\n                        catalogName\n                        alertDetails: arguments\n                        firedAt\n                    }\n                }\n            }\n        }\n    }\n": typeof types.ActiveAlertsQueryDocument,
    "\n    query AlertHistoryQuery(\n        $catalogName: [Name!]\n        $before: String\n        $last: Int!\n    ) {\n        liveSpecs(by: { names: $catalogName }) {\n            edges {\n                node {\n                    alertHistory(before: $before, last: $last) {\n                        edges {\n                            cursor\n                            node {\n                                alertType\n                                alertDetails: arguments\n                                catalogName\n                                firedAt\n                                resolvedAt\n                            }\n                        }\n                        pageInfo {\n                            ...PageInfoReverse\n                        }\n                    }\n                }\n            }\n        }\n    }\n    \n": typeof types.AlertHistoryQueryDocument,
    "\n    fragment PageInfoReverse on PageInfo {\n        hasPreviousPage\n        startCursor\n        endCursor\n    }\n": typeof types.PageInfoReverseFragmentDoc,
    "\n    query AuthRolesQuery($after: String) {\n        prefixes(by: { minCapability: read }, first: 7500, after: $after) {\n            edges {\n                node {\n                    prefix\n                    userCapability\n                }\n            }\n            pageInfo {\n                hasNextPage\n                endCursor\n            }\n        }\n    }\n": typeof types.AuthRolesQueryDocument,
};
const documents: Documents = {
    "\n    query InviteLinks($first: Int, $after: String) {\n        inviteLinks(first: $first, after: $after) {\n            edges {\n                node {\n                    token\n                    catalogPrefix\n                    capability\n                    singleUse\n                    detail\n                    createdAt\n                }\n                cursor\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n": types.InviteLinksDocument,
    "\n    mutation CreateInviteLink(\n        $catalogPrefix: Prefix!\n        $capability: Capability!\n        $singleUse: Boolean!\n        $detail: String\n    ) {\n        createInviteLink(\n            catalogPrefix: $catalogPrefix\n            capability: $capability\n            singleUse: $singleUse\n            detail: $detail\n        ) {\n            token\n            catalogPrefix\n            capability\n            singleUse\n            detail\n            createdAt\n        }\n    }\n": types.CreateInviteLinkDocument,
    "\n    mutation DeleteInviteLink($token: UUID!) {\n        deleteInviteLink(token: $token)\n    }\n": types.DeleteInviteLinkDocument,
    "\n    mutation RedeemInviteLink($token: UUID!) {\n        redeemInviteLink(token: $token) {\n            capability\n            catalogPrefix\n        }\n    }\n": types.RedeemInviteLinkDocument,
    "\n    query AlertingOverviewQuery($prefix: String!, $active: Boolean) {\n        alerts(by: { prefix: $prefix, active: $active }) {\n            edges {\n                node {\n                    alertType\n                    firedAt\n                    catalogName\n                    alertDetails: arguments\n                    resolvedAt\n                }\n            }\n        }\n    }\n": types.AlertingOverviewQueryDocument,
    "\n    query ActiveAlertCount($catalogName: Name!) {\n        liveSpecs(by: { names: [$catalogName] }) {\n            edges {\n                cursor\n                node {\n                    activeAlerts {\n                        alertType\n                    }\n                }\n            }\n        }\n    }\n": types.ActiveAlertCountDocument,
    "\n    query ActiveAlertsQuery($catalogName: [Name!]) {\n        liveSpecs(by: { names: $catalogName }) {\n            edges {\n                node {\n                    activeAlerts {\n                        alertType\n                        catalogName\n                        alertDetails: arguments\n                        firedAt\n                    }\n                }\n            }\n        }\n    }\n": types.ActiveAlertsQueryDocument,
    "\n    query AlertHistoryQuery(\n        $catalogName: [Name!]\n        $before: String\n        $last: Int!\n    ) {\n        liveSpecs(by: { names: $catalogName }) {\n            edges {\n                node {\n                    alertHistory(before: $before, last: $last) {\n                        edges {\n                            cursor\n                            node {\n                                alertType\n                                alertDetails: arguments\n                                catalogName\n                                firedAt\n                                resolvedAt\n                            }\n                        }\n                        pageInfo {\n                            ...PageInfoReverse\n                        }\n                    }\n                }\n            }\n        }\n    }\n    \n": types.AlertHistoryQueryDocument,
    "\n    fragment PageInfoReverse on PageInfo {\n        hasPreviousPage\n        startCursor\n        endCursor\n    }\n": types.PageInfoReverseFragmentDoc,
    "\n    query AuthRolesQuery($after: String) {\n        prefixes(by: { minCapability: read }, first: 7500, after: $after) {\n            edges {\n                node {\n                    prefix\n                    userCapability\n                }\n            }\n            pageInfo {\n                hasNextPage\n                endCursor\n            }\n        }\n    }\n": types.AuthRolesQueryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query InviteLinks($first: Int, $after: String) {\n        inviteLinks(first: $first, after: $after) {\n            edges {\n                node {\n                    token\n                    catalogPrefix\n                    capability\n                    singleUse\n                    detail\n                    createdAt\n                }\n                cursor\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n"): (typeof documents)["\n    query InviteLinks($first: Int, $after: String) {\n        inviteLinks(first: $first, after: $after) {\n            edges {\n                node {\n                    token\n                    catalogPrefix\n                    capability\n                    singleUse\n                    detail\n                    createdAt\n                }\n                cursor\n            }\n            pageInfo {\n                hasNextPage\n                hasPreviousPage\n                startCursor\n                endCursor\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CreateInviteLink(\n        $catalogPrefix: Prefix!\n        $capability: Capability!\n        $singleUse: Boolean!\n        $detail: String\n    ) {\n        createInviteLink(\n            catalogPrefix: $catalogPrefix\n            capability: $capability\n            singleUse: $singleUse\n            detail: $detail\n        ) {\n            token\n            catalogPrefix\n            capability\n            singleUse\n            detail\n            createdAt\n        }\n    }\n"): (typeof documents)["\n    mutation CreateInviteLink(\n        $catalogPrefix: Prefix!\n        $capability: Capability!\n        $singleUse: Boolean!\n        $detail: String\n    ) {\n        createInviteLink(\n            catalogPrefix: $catalogPrefix\n            capability: $capability\n            singleUse: $singleUse\n            detail: $detail\n        ) {\n            token\n            catalogPrefix\n            capability\n            singleUse\n            detail\n            createdAt\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation DeleteInviteLink($token: UUID!) {\n        deleteInviteLink(token: $token)\n    }\n"): (typeof documents)["\n    mutation DeleteInviteLink($token: UUID!) {\n        deleteInviteLink(token: $token)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RedeemInviteLink($token: UUID!) {\n        redeemInviteLink(token: $token) {\n            capability\n            catalogPrefix\n        }\n    }\n"): (typeof documents)["\n    mutation RedeemInviteLink($token: UUID!) {\n        redeemInviteLink(token: $token) {\n            capability\n            catalogPrefix\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AlertingOverviewQuery($prefix: String!, $active: Boolean) {\n        alerts(by: { prefix: $prefix, active: $active }) {\n            edges {\n                node {\n                    alertType\n                    firedAt\n                    catalogName\n                    alertDetails: arguments\n                    resolvedAt\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query AlertingOverviewQuery($prefix: String!, $active: Boolean) {\n        alerts(by: { prefix: $prefix, active: $active }) {\n            edges {\n                node {\n                    alertType\n                    firedAt\n                    catalogName\n                    alertDetails: arguments\n                    resolvedAt\n                }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ActiveAlertCount($catalogName: Name!) {\n        liveSpecs(by: { names: [$catalogName] }) {\n            edges {\n                cursor\n                node {\n                    activeAlerts {\n                        alertType\n                    }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query ActiveAlertCount($catalogName: Name!) {\n        liveSpecs(by: { names: [$catalogName] }) {\n            edges {\n                cursor\n                node {\n                    activeAlerts {\n                        alertType\n                    }\n                }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ActiveAlertsQuery($catalogName: [Name!]) {\n        liveSpecs(by: { names: $catalogName }) {\n            edges {\n                node {\n                    activeAlerts {\n                        alertType\n                        catalogName\n                        alertDetails: arguments\n                        firedAt\n                    }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query ActiveAlertsQuery($catalogName: [Name!]) {\n        liveSpecs(by: { names: $catalogName }) {\n            edges {\n                node {\n                    activeAlerts {\n                        alertType\n                        catalogName\n                        alertDetails: arguments\n                        firedAt\n                    }\n                }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AlertHistoryQuery(\n        $catalogName: [Name!]\n        $before: String\n        $last: Int!\n    ) {\n        liveSpecs(by: { names: $catalogName }) {\n            edges {\n                node {\n                    alertHistory(before: $before, last: $last) {\n                        edges {\n                            cursor\n                            node {\n                                alertType\n                                alertDetails: arguments\n                                catalogName\n                                firedAt\n                                resolvedAt\n                            }\n                        }\n                        pageInfo {\n                            ...PageInfoReverse\n                        }\n                    }\n                }\n            }\n        }\n    }\n    \n"): (typeof documents)["\n    query AlertHistoryQuery(\n        $catalogName: [Name!]\n        $before: String\n        $last: Int!\n    ) {\n        liveSpecs(by: { names: $catalogName }) {\n            edges {\n                node {\n                    alertHistory(before: $before, last: $last) {\n                        edges {\n                            cursor\n                            node {\n                                alertType\n                                alertDetails: arguments\n                                catalogName\n                                firedAt\n                                resolvedAt\n                            }\n                        }\n                        pageInfo {\n                            ...PageInfoReverse\n                        }\n                    }\n                }\n            }\n        }\n    }\n    \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment PageInfoReverse on PageInfo {\n        hasPreviousPage\n        startCursor\n        endCursor\n    }\n"): (typeof documents)["\n    fragment PageInfoReverse on PageInfo {\n        hasPreviousPage\n        startCursor\n        endCursor\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AuthRolesQuery($after: String) {\n        prefixes(by: { minCapability: read }, first: 7500, after: $after) {\n            edges {\n                node {\n                    prefix\n                    userCapability\n                }\n            }\n            pageInfo {\n                hasNextPage\n                endCursor\n            }\n        }\n    }\n"): (typeof documents)["\n    query AuthRolesQuery($after: String) {\n        prefixes(by: { minCapability: read }, first: 7500, after: $after) {\n            edges {\n                node {\n                    prefix\n                    userCapability\n                }\n            }\n            pageInfo {\n                hasNextPage\n                endCursor\n            }\n        }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;