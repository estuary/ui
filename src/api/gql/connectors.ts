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
                    defaultSpec {
                        id
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

export const CONNECTOR_TAG_QUERY = graphql(`
    query ConnectorTagData($imageName: String!, $fullImageName: String!) {
        connector(imageName: $imageName) {
            id
            imageName
            logoUrl
            title
        }
        connectorSpec(fullImageName: $fullImageName) {
            id
            imageTag
            defaultCaptureInterval
            disableBackfill
            documentationUrl
            endpointSpecSchema
            resourceSpecSchema
            protocol
        }
    }
`);
