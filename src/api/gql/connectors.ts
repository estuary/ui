import type { ConnectorTag, ConnectorWithTagQuery } from 'src/api/types';
import type {
    SingleConnectorQuery,
    ConnectorsGridQuery,
} from 'src/gql-types/graphql';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useCallback } from 'react';

import { useClient } from 'urql';

import { graphql } from 'src/gql-types';

export type ConnectorGridNode =
    ConnectorsGridQuery['connectors']['edges'][number]['node'];

export const CONNECTORS_QUERY = graphql(`
    query ConnectorsGrid($filter: ConnectorsFilter, $after: String) {
        connectors(first: 100, after: $after, filter: $filter) {
            edges {
                cursor
                node {
                    id
                    imageName
                    logoUrl
                    title
                    recommended
                    shortDescription
                    connectorTag(orDefault: true) {
                        id
                        connectorId
                        imageTag
                        documentationUrl
                        protocol
                    }
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`);

export const CONNECTOR_BY_ID_QUERY = graphql(`
    query SingleConnector($id: Id!) {
        connector(id: $id) {
            id
            imageName
            logoUrl
            title
            recommended
            shortDescription
            connectorTag(orDefault: true) {
                id
                connectorId
                imageTag
                defaultCaptureInterval
                disableBackfill
                documentationUrl
                endpointSpecSchema
                resourceSpecSchema
                protocol
            }
        }
    }
`);

// Maps a GQL SingleConnector result to the legacy ConnectorWithTagQuery shape
// used by workflow hydration and downstream stores.
export const toConnectorWithTagQuery = (
    node: NonNullable<SingleConnectorQuery['connector']>
): ConnectorWithTagQuery | null => {
    const { connectorTag } = node;
    if (!connectorTag) return null;

    const tag: ConnectorTag = {
        id: connectorTag.id,
        connector_id: connectorTag.connectorId,
        image_tag: connectorTag.imageTag,
        documentation_url: connectorTag.documentationUrl ?? '',
        endpoint_spec_schema: connectorTag.endpointSpecSchema,
        image_name: node.imageName,
        protocol: (connectorTag.protocol ?? 'capture') as EntityWithCreateWorkflow,
        title: node.title ?? '',
    };

    return {
        id: node.id,
        detail: node.shortDescription ?? '',
        image_name: node.imageName,
        image: node.logoUrl ?? '',
        recommended: node.recommended,
        title: node.title ?? '',
        connector_tags: [tag],
    } as ConnectorWithTagQuery;
};

export function useGetSingleConnector() {
    const client = useClient();

    return useCallback(
        async (connectorId: string) => {
            const result = await client
                .query(
                    CONNECTOR_BY_ID_QUERY,
                    { id: connectorId },
                    { requestPolicy: 'network-only' }
                )
                .toPromise();

            if (result.error || !result.data?.connector) {
                return {
                    data: null,
                    error: result.error ?? 'Connector not found',
                };
            }

            const mapped = toConnectorWithTagQuery(result.data.connector);
            return { data: mapped ? [mapped] : [], error: null };
        },
        [client]
    );
}
