import { useCallback } from 'react';

import { gql, useClient } from 'urql';

// Manual response type for the full connector query.
// The generated types in src/gql-types/graphql.ts are outdated and do not
// reflect all fields fetched by CONNECTOR_QUERY.
interface ConnectorQueryResponse {
    connector?: {
        imageName: string;
        logoUrl?: string | null;
        title?: string | null;
        connectorTag?: {
            disableBackfill: boolean;
            documentationUrl?: string | null;
            endpointSpecSchema?: any | null;
            imageTag: string;
            resourceSpecSchema?: any | null;
        } | null;
    } | null;
}

// The combined connectorTag + parent connector node used throughout the app.
// Note: the GQL schema does not expose UUID `id` fields for Connector or
// ConnectorTag — those are PostgREST-only identifiers.
export interface ConnectorTagGqlNode {
    disableBackfill: boolean;
    documentationUrl?: string | null;
    endpointSpecSchema?: any | null;
    imageTag: string;
    resourceSpecSchema?: any | null;
    connector: {
        imageName: string;
        logoUrl?: string | null;
        title?: string | null;
    };
}

const CONNECTOR_QUERY = gql<ConnectorQueryResponse, { imageName: string }>`
    query SingleConnectorQuery($imageName: String!) {
        connector(imageName: $imageName) {
            imageName
            logoUrl
            title
            connectorTag(orDefault: true) {
                disableBackfill
                documentationUrl
                endpointSpecSchema
                imageTag
                resourceSpecSchema
            }
        }
    }
`;

export function useGetSingleConnectorTag() {
    const client = useClient();

    return useCallback(
        (imageName: string) => {
            return client
                .query(
                    CONNECTOR_QUERY,
                    { imageName },
                    { requestPolicy: 'network-only' }
                )
                .toPromise();
        },
        [client]
    );
}
