import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getStatsForDashboard, Grains } from 'api/stats';
import useDashboardUsageStore from 'components/dashboard/useDashboardUsageStore';
import { DateTime, DateTimeUnit, DurationUnit, Interval } from 'luxon';
import { useMemo } from 'react';
import {
    CatalogStats_Dashboard,
    CatalogStats_Graph,
    DefaultStats,
    Entity,
} from 'types';
import { hasLength } from 'utils/misc-utils';

const getDateTimeUnit = (grain: Grains): DateTimeUnit => {
    switch (grain) {
        case 'monthly':
            return 'month';
        case 'hourly':
            return 'hour';
        default:
            return 'day';
    }
};

const getDurationUnit = (grain: Grains): DurationUnit => {
    switch (grain) {
        case 'monthly':
            return 'months';
        case 'hourly':
            return 'hours';
        default:
            return 'days';
    }
};

const isDefaultStatistic = (
    datum: CatalogStats_Dashboard | DefaultStats
): datum is DefaultStats => 'bytes_read_by_me' in datum;

export default function useDashboardStats(
    tenant: string,
    explicitGrain?: Grains,
    explicitRange?: number,
    entityType?: Entity
) {
    const endDate = useDashboardUsageStore((store) => store.endDate);
    const storedGrain = useDashboardUsageStore((store) => store.grain);
    const storedRange = useDashboardUsageStore((store) => store.range);

    const grain = explicitGrain ?? storedGrain;
    const durationUnit = getDurationUnit(grain);

    const range = explicitRange ?? storedRange;

    const { data, error, isValidating } = useQuery(
        hasLength(tenant)
            ? getStatsForDashboard(
                  tenant,
                  grain,
                  endDate,
                  {
                      [durationUnit]: range,
                  },
                  entityType
              )
            : null,
        {
            refreshInterval: 15000,
        }
    );

    // TODO (graphs)
    // This approach is kinda bad because the benefit of using dataset/dimensions is we didn't have to loop over data.
    //  However, to get this feature in quick this is the quickest way to do that. We should look at the graph
    //  and potentially get it off of dataset/dimensions since we are already having to loop over all the intervals
    //  and generating the proper data.
    const stats = useMemo(() => {
        if (!data || data.length === 0) {
            return;
        }

        // Server is in UTC so start with that
        const dateTimeUnit = getDateTimeUnit(grain);
        const max = DateTime.fromJSDate(endDate).toUTC().startOf(dateTimeUnit);

        // Subtracting 1 here because the interval is inclusive of the minimum
        const min = max.minus({ [durationUnit]: range - 1 });

        // Go through the entire interval and populate the response if we have data
        //  otherwise default to an "empty" response
        return Interval.fromDateTimes(min, max.plus({ [durationUnit]: 1 }))
            .splitBy({ [durationUnit]: 1 })
            .map((timeInterval) => {
                const ts =
                    timeInterval.start?.toFormat(`yyyy-MM-dd'T'HH:mm:ssZZ`) ??
                    '';

                let bytes_read = 0;
                let bytes_written = 0;
                let docs_read = 0;
                let docs_written = 0;

                data.filter((datum) => datum.ts === ts).forEach((datum) => {
                    if (isDefaultStatistic(datum)) {
                        bytes_read += datum.bytes_read_by_me;
                        bytes_written += datum.bytes_written_by_me;

                        docs_read += datum.docs_read_by_me;
                        docs_written += datum.docs_written_by_me;

                        return;
                    }

                    bytes_read += datum.bytes_read ?? 0;
                    bytes_written += datum.bytes_written ?? 0;

                    docs_read += datum.docs_read ?? 0;
                    docs_written += datum.docs_written ?? 0;
                });

                return {
                    ts,
                    bytes_read,
                    bytes_written,
                    docs_read,
                    docs_written,
                } as CatalogStats_Graph;
            });
    }, [data, durationUnit, endDate, grain, range]);

    console.log(stats);

    // Not always returning an array so we know when the empty array is a response
    //  vs a default. That way we can keep showing old data while new data is going fetched
    //  during isValidating
    return {
        stats,
        error,
        isValidating,
    };
}
