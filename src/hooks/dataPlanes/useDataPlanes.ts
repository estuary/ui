import type { DataPlanesFilter } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { useQuery } from 'urql';

import { DATA_PLANES_QUERY, toDataPlaneNode } from 'src/api/gql/dataPlanes';
import { useAllPages } from 'src/api/gql/useAllPages';

type DataPlanesArgs = {
    public?: boolean;
    cursor?: string;
    limit?: number;
};

export function useDataPlanes() {
    const {
        data: dataPlanes,
        loading,
        error,
    } = useAllPages(DATA_PLANES_QUERY, {
        getConnection: (data) => data.dataPlanes,
        transform: toDataPlaneNode,
        variables: { first: 100 },
    });

    return { dataPlanes, loading, error };
}

/**
 * Queries dataPlanes for the specified tenant prefix.
 *
 * @param tenantPrefix The tenant prefix to filter data planes by. If not provided, no filtering will be applied.
 * @param args Optional args to futher filter or paginate the results.
 * @returns GQL response containing the list of matching data planes.
 */
export function useDataPlanesQuery(
    tenantPrefix: string,
    { public: isPublic, cursor = '', limit = 10 }: DataPlanesArgs
) {
    const filter: DataPlanesFilter = useMemo(
        () => ({
            tenant: { eq: tenantPrefix },
            public: { eq: isPublic },
        }),
        [tenantPrefix, isPublic]
    );

    const [{ fetching, data, error }] = useQuery({
        query: DATA_PLANES_QUERY,
        variables: { filter, after: cursor, first: limit },
        pause: !tenantPrefix,
    });

    const dataPlanes = useMemo(() => {
        return (
            data?.dataPlanes?.edges?.map((edge) =>
                toDataPlaneNode(edge.node)
            ) ?? []
        );
    }, [data]);

    const pageInfo = useMemo(() => {
        return data?.dataPlanes?.pageInfo ?? null;
    }, [data]);

    return { dataPlanes, fetching, error, pageInfo };
}
