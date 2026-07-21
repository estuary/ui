import type { DataPlanesQuery } from 'src/gql-types/graphql';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { graphql } from 'src/gql-types';

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

// Unauthenticated query for the pre-tenant onboarding flow. The
// authenticated `dataPlanes` query returns nothing until the user
// has grants, which a brand-new signup does not.
export const PUBLIC_DATA_PLANES_QUERY = graphql(`
    query PublicDataPlanes($after: String) {
        publicDataPlanes(first: 100, after: $after) {
            edges {
                node {
                    name
                    cloudProvider
                    region
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`);

type DataPlaneGqlNode = DataPlanesQuery['dataPlanes']['edges'][number]['node'];

export interface DataPlaneNode extends Omit<DataPlaneGqlNode, 'cloudProvider'> {
    // Narrower than the schema's DataPlaneCloudProvider, which also allows LOCAL
    cloudProvider: CloudProvider;
    scope: 'public' | 'private';
}

// Transform GQL response to exported type (adds derived fields)
export const toDataPlaneNode = (node: DataPlaneGqlNode): DataPlaneNode => {
    return {
        ...node,
        cloudProvider: node.cloudProvider as CloudProvider,
        scope: node.isPublic ? 'public' : 'private',
    };
};
