import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { DefaultStatsWithDocument, getStatsForDashboard } from 'api/stats';
import { isArray } from 'lodash';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { CatalogStats_Dashboard } from 'types';

const isDefaultStatistic = (
    datum: CatalogStats_Dashboard | DefaultStatsWithDocument
): datum is DefaultStatsWithDocument => 'bytes_read_by_me' in datum;

export default function useMonthlyUsage() {
    const endDate = DateTime.utc().startOf('month');

    const { data, error, isValidating } = useQuery(
        getStatsForDashboard('melk', 'monthly', endDate),
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
        isValidating,
        loading: !isArray(data),
        materializationUsage,
    };
}
