import type { DataPlanesQuery } from 'src/gql-types/graphql';
import type { CloudProvider } from 'src/utils/cloudRegions';

import { graphql } from 'src/gql-types';

export const DATA_PLANES_QUERY = graphql(`
    query DataPlanes($filter: DataPlanesFilter, $first: Int, $after: String) {
        dataPlanes(filter: $filter, first: $first, after: $after) {
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
                ...PageInfoFields
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
