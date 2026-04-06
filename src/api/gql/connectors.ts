import type { ConnectorsGridQuery } from 'src/gql-types/graphql';

import { graphql } from 'src/gql-types';

export type ConnectorGridNode =
    ConnectorsGridQuery['connectors']['edges'][number]['node'];

// TODO (GQL:Connector) - fine for now but this ignores pagination and just
//  fetches 500 all at once
export const CONNECTORS_QUERY = graphql(`
    query ConnectorsGrid($filter: ConnectorsFilter, $after: String) {
        connectors(first: 500, after: $after, filter: $filter) {
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
