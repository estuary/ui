import type { DataPlanesFilter } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { useQuery } from 'urql';

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
        variables: { first: 100 },
    });

    return { dataPlanes, loading, error };
}

/** Fetches one page of public data planes for the tenant prefix. */
export function usePublicDataPlanesQuery(
    tenantPrefix: string,
    pageSize: number,
    cursor = ''
) {
    const filter: DataPlanesFilter = useMemo(
        () => ({
            tenant: { eq: tenantPrefix },
            public: { eq: true },
        }),
        [tenantPrefix]
    );

    const [{ fetching, data, error }] = useQuery({
        query: DATA_PLANES_QUERY,
        variables: { filter, after: cursor, first: pageSize },
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
