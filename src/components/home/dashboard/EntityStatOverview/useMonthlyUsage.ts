import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { DefaultStatsWithDocument, getStatsForDashboard } from 'api/stats';
import { useMemo } from 'react';
import { useTenantStore } from 'stores/Tenant/Store';
import { CatalogStats_Dashboard } from 'types';
import { hasLength } from 'utils/misc-utils';

// The interfaces of this union type have minimal overlap and a type guard is required
// to access the properties specific to one of the interfaces.
const isDefaultStatistic = (
    datum: CatalogStats_Dashboard | DefaultStatsWithDocument
): datum is DefaultStatsWithDocument => 'bytes_read_by_me' in datum;

export default function useMonthlyUsage() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const query = useMemo(
        () =>
            hasLength(selectedTenant)
                ? getStatsForDashboard(selectedTenant, 'monthly')
                : null,
        [selectedTenant]
    );

    const { data, error, isLoading } = useQuery(query);

    const [captureUsage, materializationUsage] = useMemo(() => {
        let dataWritten = 0;
        let dataRead = 0;

        if (data) {
            data.filter(
                ({ task_stats }) =>
                    task_stats &&
                    (Object.hasOwn(task_stats, 'capture') ||
                        Object.hasOwn(task_stats, 'materialize'))
            ).forEach((datum) => {
                if (isDefaultStatistic(datum)) {
                    dataWritten += datum.bytes_written_by_me;
                    dataRead += datum.bytes_read_by_me;

                    return;
                }

                dataWritten += datum.bytes_written ?? 0;
                dataRead += datum.bytes_read ?? 0;
            });
        }

        return [dataWritten, dataRead];
    }, [data]);

    return {
        captureUsage,
        error,
        isLoading,
        materializationUsage,
    };
}
