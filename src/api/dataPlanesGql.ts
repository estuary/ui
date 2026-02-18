import type { CloudProvider } from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { gql, useQuery } from 'urql';

// GraphQL response type (camelCase from API)
interface DataPlaneGqlNode {
    dataPlaneName: string;
    cloudProvider: CloudProvider;
    isPublic: boolean;
    region: string;
    awsIamUserArn: string | null;
    gcpServiceAccountEmail: string | null;
}

// Exported type with snake_case aliases for migration
export interface DataPlaneNode {
    // Canonical camelCase fields
    dataPlaneName: string;
    cloudProvider: CloudProvider;
    isPublic: boolean;
    region: string;
    scope: 'public' | 'private';
    awsIamUserArn: string | null;
    gcpServiceAccountEmail: string | null;

    // Deprecated snake_case aliases (for migration from PostgREST)
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
                    awsIamUserArn
                    gcpServiceAccountEmail
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
