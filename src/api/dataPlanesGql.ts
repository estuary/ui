import { gql, useQuery } from 'urql';

// GraphQL response type (camelCase from API)
interface DataPlaneGqlNode {
    dataPlaneName: string;
    cloudProvider: string;
    isPrivate: boolean;
    region: string;
    awsIamUserArn: string | null;
    gcpServiceAccountEmail: string | null;
}

// Exported type with snake_case aliases for migration
export interface DataPlaneNode {
    // Canonical camelCase fields
    dataPlaneName: string;
    cloudProvider: string;
    isPrivate: boolean;
    region: string;
    scope: 'public' | 'private';
    awsIamUserArn: string | null;
    gcpServiceAccountEmail: string | null;

    // Deprecated snake_case aliases (for migration from PostgREST)
    /** @deprecated Use `dataPlaneName` instead */
    data_plane_name: string;
    /** @deprecated Use `cloudProvider` instead */
    cloud_provider: string;
    /** @deprecated Use `isPrivate` instead */
    is_private: boolean;
    /** @deprecated Use `awsIamUserArn` instead */
    aws_iam_user_arn: string | null;
    /** @deprecated Use `gcpServiceAccountEmail` instead */
    gcp_service_account_email: string | null;
}

// Transform GQL response to exported type (adds snake_case aliases and derived fields)
const toDataPlaneNode = (node: DataPlaneGqlNode): DataPlaneNode => ({
    ...node,
    data_plane_name: node.dataPlaneName,
    cloud_provider: node.cloudProvider,
    is_private: node.isPrivate,
    aws_iam_user_arn: node.awsIamUserArn,
    gcp_service_account_email: node.gcpServiceAccountEmail,
    scope: node.isPrivate ? 'private' : 'public',
});

interface DataPlanesEdge {
    node: DataPlaneGqlNode;
}

interface DataPlanesConnection {
    edges: DataPlanesEdge[];
}

interface DataPlanesResponse {
    dataPlanes: DataPlanesConnection;
}

// // Example data planes for development
export const MOCK_DATA_PLANES: DataPlaneGqlNode[] = [
    {
        dataPlaneName: 'ops/dp/public/gcp-us-central1-prod',
        cloudProvider: 'gcp',
        region: 'us-central1',
        isPrivate: false,
        // reactor_address: 'https://us-central1.v1.estuary-data.dev',
        // cidr_blocks: null,
        gcpServiceAccountEmail:
            'flow-gcp-us-central1@estuary-data.iam.gserviceaccount.com',
        awsIamUserArn: 'arn:aws:iam::123456789012:user/flow-gcp-us-central1',
        // data_plane_fqdn: 'us-central1.v1.estuary-data.dev',
    },
    {
        dataPlaneName: 'ops/dp/public/gcp-us-east1-prod',
        cloudProvider: 'gcp',
        region: 'us-east1',
        isPrivate: false,
        // reactor_address: 'https://us-east1.v1.estuary-data.dev',
        // cidr_blocks: null,
        gcpServiceAccountEmail:
            'flow-gcp-us-east1@estuary-data.iam.gserviceaccount.com',
        awsIamUserArn: 'arn:aws:iam::123456789012:user/flow-gcp-us-east1',
        // data_plane_fqdn: 'us-east1.v1.estuary-data.dev',
    },
    {
        dataPlaneName: 'ops/dp/public/aws-us-east-1',
        cloudProvider: 'aws',
        region: 'us-east-1',
        isPrivate: false,
        // reactor_address: 'https://aws-us-east-1.v1.estuary-data.dev',
        // cidr_blocks: null,
        gcpServiceAccountEmail:
            'flow-aws-us-east-1@estuary-data.iam.gserviceaccount.com',
        awsIamUserArn: 'arn:aws:iam::123456789012:user/flow-aws-us-east-1',
        // data_plane_fqdn: 'aws-us-east-1.v1.estuary-data.dev',
    },
    {
        dataPlaneName: 'ops/dp/public/aws-eu-west-1',
        cloudProvider: 'aws',
        region: 'eu-west-1',
        isPrivate: false,
        // reactor_address: 'https://aws-eu-west-1.v1.estuary-data.dev',
        // cidr_blocks: null,
        gcpServiceAccountEmail:
            'flow-aws-eu-west-1@estuary-data.iam.gserviceaccount.com',
        awsIamUserArn: 'arn:aws:iam::123456789012:user/flow-aws-eu-west-1',
        // data_plane_fqdn: 'aws-eu-west-1.v1.estuary-data.dev',
    },
    // Private data planes
    {
        dataPlaneName: 'ops/dp/private/acme-corp/gcp-us-central1-prod',
        cloudProvider: 'gcp',
        region: 'us-central1',
        isPrivate: true,
        // reactor_address: 'https://acme-prod.estuary-data.dev',
        // cidr_blocks: ['10.0.0.0/8', '172.16.0.0/12'],
        gcpServiceAccountEmail:
            'flow-acme-gcp-us-central1@acme-corp.iam.gserviceaccount.com',
        awsIamUserArn:
            'arn:aws:iam::987654321098:user/flow-acme-gcp-us-central1',
        // data_plane_fqdn: 'acme-prod.estuary-data.dev',
    },
    {
        dataPlaneName: 'ops/dp/private/acme-corp/gcp-us-east1-prod',
        cloudProvider: 'gcp',
        region: 'us-east1',
        isPrivate: true,
        // reactor_address: 'https://acme-prod.estuary-data.dev',
        // cidr_blocks: ['10.0.0.0/8', '172.16.0.0/12'],
        gcpServiceAccountEmail:
            'flow-acme-gcp-us-east1@acme-corp.iam.gserviceaccount.com',
        awsIamUserArn: 'arn:aws:iam::987654321098:user/flow-acme-gcp-us-east1',
        // data_plane_fqdn: 'acme-prod.estuary-data.dev',
    },
];

// GraphQL Query
const DATA_PLANES_QUERY = gql<DataPlanesResponse>`
    query DataPlanes {
        dataPlanes {
            edges {
                node {
                    dataPlaneName
                    cloudProvider
                    region
                    isPrivate
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

    // const dataPlanes =
    //     result.data?.dataPlanes.edges.map((edge) =>
    //         toDataPlaneNode(edge.node)
    //     ) ?? [];

    const dataPlanes = MOCK_DATA_PLANES.map((node) => toDataPlaneNode(node));

    return {
        dataPlanes,
        loading: result.fetching,
        error: result.error,
    };
}
