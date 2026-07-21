import {
    PUBLIC_DATA_PLANES_QUERY,
    toPublicDataPlaneNode,
} from 'src/api/gql/dataPlanes';
import { useAllPages } from 'src/api/gql/useAllPages';

// Public planes for the pre-tenant onboarding flow. The authenticated
// `dataPlanes` query is useless here: a brand-new user has no grants yet,
// so it returns nothing until the tenant is provisioned.
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
