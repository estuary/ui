import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getLiveSpecShards } from 'api/liveSpecsExt';
import { useMemo } from 'react';
import { useTenantStore } from 'stores/Tenant/Store';
import { Entity } from 'types';
import { hasLength, RESPONSE_DATA_LIMIT } from 'utils/misc-utils';

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
