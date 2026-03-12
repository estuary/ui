import { DATA_PLANES_QUERY, toDataPlaneNode } from 'src/api/gql/dataPlanes';
import { useAllPages } from 'src/api/gql/useAllPages';

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
