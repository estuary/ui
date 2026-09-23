import {
    PUBLIC_DATA_PLANES_QUERY,
    toPublicDataPlaneNode,
} from 'src/api/gql/dataPlanes';
import { useAllPages } from 'src/api/gql/useAllPages';

export function usePublicDataPlanes() {
    const {
        data: dataPlanes,
        loading,
        error,
    } = useAllPages(PUBLIC_DATA_PLANES_QUERY, {
        getConnection: (data) => data.publicDataPlanes,
        transform: toPublicDataPlaneNode,
    });

    return { dataPlanes, loading, error };
}
