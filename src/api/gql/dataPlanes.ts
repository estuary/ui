import type { DataPlanesQuery } from 'src/gql-types/graphql';

import { graphql } from 'src/gql-types';

type DataPlaneGqlNode = DataPlanesQuery['dataPlanes']['edges'][number]['node'];

export interface DataPlaneNode extends DataPlaneGqlNode {
    // temporary field for backward compatibilty with a bunch of dataplane utility functions
    scope: 'public' | 'private';
}

// Transform GQL response to exported type (adds derived fields)
export const toDataPlaneNode = (node: DataPlaneGqlNode): DataPlaneNode => {
    return {
        ...node,
        scope: node.isPublic ? 'public' : 'private',
    };
};

export const DATA_PLANES_QUERY = graphql(`
    query DataPlanes($after: String) {
        dataPlanes(first: 100, after: $after) {
            edges {
                node {
                    name
                    cloudProvider
                    region
                    isPublic
                    fqdn
                    cidrBlocks
                    awsIamUserArn
                    gcpServiceAccountEmail
                    azureApplicationClientId
                    azureApplicationName
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`);
