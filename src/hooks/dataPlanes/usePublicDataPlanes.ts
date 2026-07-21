import type { PublicDataPlanesQuery } from 'src/gql-types/graphql';

import { PUBLIC_DATA_PLANES_QUERY } from 'src/api/gql/dataPlanes';
import { useAllPages } from 'src/api/gql/useAllPages';

type PublicDataPlaneGqlNode =
    PublicDataPlanesQuery['publicDataPlanes']['edges'][number]['node'];

export interface PublicDataPlaneNode extends PublicDataPlaneGqlNode {}

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
        transform: (node): PublicDataPlaneNode => node,
    });

    return { dataPlanes, loading, error };
}
