import { gql, useQuery } from 'urql';

// GraphQL response type (camelCase from API)
interface DataPlaneGqlNode {
    dataPlaneName: string;
    cloudProvider: string;
    isPrivate: boolean;
    region: string;
}

// Exported type with snake_case aliases for migration
export interface DataPlaneNode {
    // Canonical camelCase fields
    dataPlaneName: string;
    cloudProvider: string;
    isPrivate: boolean;
    region: string;

    // Deprecated snake_case aliases (for migration from PostgREST)
    /** @deprecated Use `dataPlaneName` instead */
    data_plane_name: string;
    /** @deprecated Use `cloudProvider` instead */
    cloud_provider: string;
    /** @deprecated Use `isPrivate` instead */
    is_private: boolean;
}

// Transform GQL response to include snake_case aliases
const addSnakeCaseAliases = (node: DataPlaneGqlNode): DataPlaneNode => ({
    ...node,
    data_plane_name: node.dataPlaneName,
    cloud_provider: node.cloudProvider,
    is_private: node.isPrivate,
});

interface DataPlanesEdge {
    node: DataPlaneNode;
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
                    region
                    cloudProvider
                    isPrivate
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
            addSnakeCaseAliases(edge.node)
        ) ?? [];

    return {
        dataPlanes,
        loading: result.fetching,
        error: result.error,
    };
}
