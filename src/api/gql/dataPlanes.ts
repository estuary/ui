import type { CloudProvider } from 'src/utils/cloudRegions';

import { gql } from 'urql';

interface DataPlaneGqlNode {
    name: string;
    cloudProvider: CloudProvider;
    isPublic: boolean;
    region: string;
    cidrBlocks: string[];
    awsIamUserArn: string | null;
    gcpServiceAccountEmail: string | null;
    azureApplicationClientId: string | null;
    azureApplicationName: string | null;
    fqdn: string;
}

export interface DataPlaneNode extends DataPlaneGqlNode {
    scope: 'public' | 'private';
}

// Transform GQL response to exported type (adds snake_case aliases and derived fields)
export const toDataPlaneNode = (node: DataPlaneGqlNode): DataPlaneNode => {
    return {
        ...node,
        scope: node.isPublic ? 'public' : 'private',
    };
};

interface DataPlanesResponse {
    dataPlanes: {
        edges: {
            node: DataPlaneGqlNode;
        }[];
        pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
        };
    };
}

export const DATA_PLANES_QUERY = gql<DataPlanesResponse, { after?: string }>`
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
`;
