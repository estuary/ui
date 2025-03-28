import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getLiveSpecShards } from 'src/api/liveSpecsExt';
import { useMemo } from 'react';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { Entity } from 'src/types';
import { hasLength, RESPONSE_DATA_LIMIT } from 'src/utils/misc-utils';

export default function useActiveEntityCount(entityType: Entity) {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { data, error, isLoading } = useQuery(
        hasLength(selectedTenant)
            ? getLiveSpecShards(selectedTenant, entityType)
            : null
    );

    const count = useMemo(
        () =>
            data ? data.filter(({ disable }) => disable !== true).length : 0,
        [data]
    );

    return {
        count,
        error,
        indeterminate: data ? data.length >= RESPONSE_DATA_LIMIT : false,
        isLoading,
    };
}
