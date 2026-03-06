import type { CloudProvider } from 'src/utils/cloudRegions';

import { gql } from 'urql';

import { useAllPages } from 'src/api/gql/useAllPages';

interface DataPlaneGqlNode {
    dataPlaneName: string;
    cloudProvider: CloudProvider;
    isPublic: boolean;
    region: string;
    cidrBlocks: string[];
    awsIamUserArn: string | null;
    gcpServiceAccountEmail: string | null;
    azureApplicationClientId: string | null;
    azureApplicationName: string | null;
    dataPlaneFqdn: string;
}

export interface DataPlaneNode {
    name: string;
    cloudProvider: CloudProvider;
    isPublic: boolean;
    region: string;
    scope: 'public' | 'private';
    fqdn: string;
    cidrBlocks: string[];
    awsIamUserArn: string | null;
    gcpServiceAccountEmail: string | null;
    azureApplicationClientId: string | null;
    azureApplicationName: string | null;
}

// Transform GQL response to exported type (adds snake_case aliases and derived fields)
const toDataPlaneNode = (node: DataPlaneGqlNode): DataPlaneNode => {
    return {
        ...node,
        name: node.dataPlaneName,
        fqdn: node.dataPlaneFqdn,
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

const DATA_PLANES_QUERY = gql<DataPlanesResponse, { after?: string }>`
    query DataPlanes($after: String) {
        dataPlanes(first: 100, after: $after) {
            edges {
                node {
                    dataPlaneName
                    cloudProvider
                    region
                    isPublic
                    dataPlaneFqdn
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

export function useDataPlanes() {
    const {
        data: dataPlanes,
        loading,
        error,
    } = useAllPages(DATA_PLANES_QUERY, {
        getConnection: (data) => data.dataPlanes,
        transform: toDataPlaneNode,
    });

    return { dataPlanes, loading, error };
}
