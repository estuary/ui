import type { CloudProvider } from 'src/utils/cloudRegions';

import { gql, useQuery } from 'urql';

// GraphQL response type (camelCase from API)
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

// Exported type with snake_case aliases for migration
export interface DataPlaneNode {
    // Canonical camelCase fields
    dataPlaneName: string;
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

    // Deprecated snake_case aliases (for migration from PostgREST)
    /** @deprecated Use `fqdn` instead */
    data_plane_fqdn: string;
    /** @deprecated Use `dataPlaneName` instead */
    data_plane_name: string;
    /** @deprecated Use `cloudProvider` instead */
    cloud_provider: CloudProvider;
    /** @deprecated Use `isPublic` instead */
    is_public: boolean;
    /** @deprecated Use `awsIamUserArn` instead */
    aws_iam_user_arn: string | null;
    /** @deprecated Use `gcpServiceAccountEmail` instead */
    gcp_service_account_email: string | null;
}

// Transform GQL response to exported type (adds snake_case aliases and derived fields)
const toDataPlaneNode = (node: DataPlaneGqlNode): DataPlaneNode => {
    return {
        ...node,
        data_plane_name: node.dataPlaneName,
        cloud_provider: node.cloudProvider,
        is_public: node.isPublic,
        aws_iam_user_arn: node.awsIamUserArn,
        gcp_service_account_email: node.gcpServiceAccountEmail,
        azureApplicationClientId: node.azureApplicationClientId ?? null,
        azureApplicationName: node.azureApplicationName,
        fqdn: node.dataPlaneFqdn,
        data_plane_fqdn: node.dataPlaneFqdn,
        scope: node.isPublic ? 'public' : 'private',
    };
};

interface DataPlanesEdge {
    node: DataPlaneGqlNode;
}

interface DataPlanesConnection {
    edges: DataPlanesEdge[];
}

interface DataPlanesResponse {
    dataPlanes: DataPlanesConnection;
}

// GraphQL Query
const DATA_PLANES_QUERY = gql<DataPlanesResponse>`
    query DataPlanes {
        dataPlanes {
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
        }
    }
`;

// Hook for reactive data fetching
export function useDataPlanes() {
    const [result] = useQuery({ query: DATA_PLANES_QUERY });

    const dataPlanes =
        result.data?.dataPlanes.edges.map((edge) =>
            toDataPlaneNode(edge.node)
        ) ?? [];

    return {
        dataPlanes,
        loading: result.fetching,
        error: result.error,
    };
}
