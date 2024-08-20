import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { DefaultStatsWithDocument, getStatsForDashboard } from 'api/stats';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useTenantStore } from 'stores/Tenant/Store';
import { CatalogStats_Dashboard } from 'types';
import { hasLength } from 'utils/misc-utils';

const isDefaultStatistic = (
    datum: CatalogStats_Dashboard | DefaultStatsWithDocument
): datum is DefaultStatsWithDocument => 'bytes_read_by_me' in datum;

export default function useMonthlyUsage() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const endDate = DateTime.utc().startOf('month');

    const { data, error, isLoading } = useQuery(
        hasLength(selectedTenant)
            ? getStatsForDashboard(selectedTenant, 'monthly', endDate)
            : null,
        {
            refreshInterval: 15000,
        }
    );

    const [captureUsage, materializationUsage] = useMemo(() => {
        let dataWritten = 0;
        let dataRead = 0;

        if (data) {
            data.filter(
                ({ flow_document }) =>
                    Object.hasOwn(flow_document, 'taskStats') &&
                    (Object.hasOwn(flow_document.taskStats, 'capture') ||
                        Object.hasOwn(flow_document.taskStats, 'materialize'))
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
