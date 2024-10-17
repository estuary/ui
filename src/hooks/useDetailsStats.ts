import { getStatsForDetails } from 'api/stats';
import { useEntityType } from 'context/EntityContext';
import { hasLength } from 'utils/misc-utils';
import { CatalogStats_Details } from 'types';
import { useMemo } from 'react';
import { DateTime, Interval } from 'luxon';
import { find } from 'lodash';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { defaultQueryDateFormat } from 'services/luxon';
import useDetailsUsageStore from 'stores/DetailsUsage/useDetailsUsageStore';

function useDetailsStats(catalogName: string) {
    const entityType = useEntityType();
    const range = useDetailsUsageStore((store) => store.range);

    const { data, error, isValidating } = useQuery(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType, range)
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
        const max = DateTime.utc().startOf(range.timeUnit);

        // Subtracting 1 here because the interval is inclusive of the minimum
        const min = max.minus({ [range.relativeUnit]: range.amount - 1 });

        // Go through the entire interval and populate the response if we have data
        //  otherwise default to an "empty" response
        return Interval.fromDateTimes(
            min,
            max.plus({ [range.relativeUnit]: 1 })
        )
            .splitBy({ [range.relativeUnit]: 1 })
            .map((timeInterval) => {
                const ts =
                    timeInterval.start?.toFormat(defaultQueryDateFormat) ?? '';

                // Fetch data or default to empty object. This handles the rare case
                //  where an entity will miss some rows here and there with stats
                const response =
                    find(data, { ts }) ??
                    ({
                        ts,
                        catalog_name: '',
                        grain: range.grain,
                        bytes_read: 0,
                        docs_read: 0,
                        bytes_written: 0,
                        docs_written: 0,
                    } as CatalogStats_Details);

                // We want to overwrite time stamp with our own to not worry about
                //  converting UTC to local times
                return {
                    ...response,
                    ts,
                };
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
