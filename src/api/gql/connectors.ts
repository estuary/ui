import { useCallback } from 'react';

import { useClient } from 'urql';

import { graphql } from 'src/gql-types';

const CONNECTOR_QUERY = graphql(`
    query SingleConnectorQuery($imageName: String!) {
        connector(imageName: $imageName) {
            id
            imageName
            logoUrl
            title
            connectorTag(orDefault: true) {
                id
                disableBackfill
                defaultCaptureInterval
                documentationUrl
                endpointSpecSchema
                imageTag
                resourceSpecSchema
            }
        }
    }
`);

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
