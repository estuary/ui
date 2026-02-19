import type { CatalogStats_Details } from 'src/types';

import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { find } from 'lodash';
import { DateTime, Interval } from 'luxon';

import { getStatsForDetails } from 'src/api/stats';
import { useEntityType } from 'src/context/EntityContext';
import {
    defaultQueryDateFormat,
    LUXON_GRAIN_SETTINGS,
} from 'src/services/luxon';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';
import { hasLength } from 'src/utils/misc-utils';

function useDetailsStats(catalogName: string) {
    const entityType = useEntityType();

    const range = useDetailsUsageStore((state) => state.range);
    const { relativeUnit, timeUnit } = LUXON_GRAIN_SETTINGS[range.grain];

    const { data, error, isValidating } = useQuery(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType, range)
            : null,
        {
            revalidateOnMount: true,
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
        const max = DateTime.utc().startOf(timeUnit);

        // Subtracting 1 here because the interval is inclusive of the minimum
        const min = max.minus({
            [relativeUnit]: range.amount - 1,
        });

        // Go through the entire interval and populate the response if we have data
        //  otherwise default to an "empty" response
        return Interval.fromDateTimes(min, max.plus({ [relativeUnit]: 1 }))
            .splitBy({ [relativeUnit]: 1 })
            .map((timeInterval) => {
                const ts =
                    timeInterval.start?.toFormat(defaultQueryDateFormat) ?? '';

                // Fetch data or default to empty object. This handles the rare case
                //  where an entity will miss some rows here and there with stats
                return (
                    find(data, { ts }) ??
                    ({
                        ts,
                        catalog_name: '',
                        grain: range.grain,
                        bytes_read: 0,
                        docs_read: 0,
                        bytes_written: 0,
                        docs_written: 0,
                    } as CatalogStats_Details)
                );
            });
    }, [data, range.amount, range.grain, relativeUnit, timeUnit]);

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
