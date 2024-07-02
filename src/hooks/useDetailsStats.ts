import { getStatsForDetails } from 'api/stats';
import { useEntityType } from 'context/EntityContext';
import { hasLength } from 'utils/misc-utils';
import { CatalogStats_Details } from 'types';
import useDetailsUsageStore from 'components/shared/Entity/Details/Usage/useDetailsUsageStore';
import { useMemo } from 'react';
import { DateTime, Interval } from 'luxon';
import { find } from 'lodash';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

function useDetailsStats(catalogName: string, grain: string) {
    const entityType = useEntityType();
    const range = useDetailsUsageStore((store) => store.range);

    const { data, error, isValidating } = useQuery(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType, grain, {
                  hours: range,
              })
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
        const max = DateTime.utc().startOf('hour');

        // Subtracting 1 here because the interval is inclusive of the minimum
        const min = max.minus({ hours: range - 1 });

        // Go through the entire interval and populate the response if we have data
        //  otherwise default to an "empty" response
        return Interval.fromDateTimes(min, max.plus({ hours: 1 }))
            .splitBy({ hours: 1 })
            .map((timeInterval) => {
                const ts =
                    timeInterval.start?.toFormat(`yyyy-MM-dd'T'HH:mm:ssZZ`) ??
                    '';

                return (
                    find(data, { ts }) ??
                    ({
                        ts,
                        catalog_name: '',
                        grain: 'hourly',
                        bytes_read: 0,
                        docs_read: 0,
                        bytes_written: 0,
                        docs_written: 0,
                    } as CatalogStats_Details)
                );
            });
    }, [data, range]);

    // Not always returning an array so we know when the empty array is a response
    //  vs a default. That way we can keep showing old data while new data is geing fetched
    //  during isValidating
    return {
        stats,
        error,
        isValidating,
    };
}

export default useDetailsStats;
