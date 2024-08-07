import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getLiveSpecShards } from 'api/liveSpecsExt';
import { useMemo } from 'react';
import { Entity } from 'types';

export default function useActiveEntityCount(entityType: Entity) {
    const { data, error, isValidating } = useQuery(
        getLiveSpecShards(entityType),
        {
            refreshInterval: 15000,
        }
    );

    const count = useMemo(
        () =>
            data ? data.filter(({ disable }) => disable !== true).length : 0,
        [data]
    );

    return { count, error, isValidating };
}
