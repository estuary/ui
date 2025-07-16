import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { getStatsForDashboard } from 'src/api/stats';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength, RESPONSE_DATA_LIMIT } from 'src/utils/misc-utils';

export default function useMonthlyUsage() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const query = useMemo(
        () =>
            hasLength(selectedTenant)
                ? getStatsForDashboard(selectedTenant)
                : null,
        [selectedTenant]
    );

    const { data, error, isLoading } = useQuery(query);

    const [captureUsage, materializationUsage] = useMemo(() => {
        let dataWritten = 0;
        let dataRead = 0;

        if (!error && data) {
            data.forEach((datum) => {
                dataWritten += datum.bytes_written_by_me ?? 0;
                dataRead += datum.bytes_read_by_me ?? 0;
            });
        }

        return [dataWritten, dataRead];
    }, [data, error]);

    return {
        captureUsage,
        error,
        indeterminate: data ? data.length >= RESPONSE_DATA_LIMIT : false,
        isLoading,
        materializationUsage,
    };
}
