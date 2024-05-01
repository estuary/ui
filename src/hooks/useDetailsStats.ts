import { getStatsForDetails } from 'api/stats';
import { useEntityType } from 'context/EntityContext';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { hasLength } from 'utils/misc-utils';
import { CatalogStats_Details } from 'types';
import useDetailsUsageStore from 'components/shared/Entity/Details/Usage/useDetailsUsageStore';
import { useMemo } from 'react';
import { DateTime, Interval } from 'luxon';
import { find } from 'lodash';

function useDetailsStats(catalogName: string, grain: string) {
    const entityType = useEntityType();
    const range = useDetailsUsageStore((store) => store.range);

    const { data, error, isValidating } = useSelectNew<CatalogStats_Details>(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType, grain, {
                  hours: range,
              })
            : null,
        {
            refreshInterval: 15000,
        }
    );

    const stats = useMemo(() => {
        if (!data?.data || data.data.length === 0) {
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
                    find(data.data, { ts }) ??
                    ({
                        ts,
                        catalog_name: '',
                        grain: 'hourly',
                        bytes_read: NaN,
                        docs_read: NaN,
                        bytes_written: NaN,
                        docs_written: NaN,
                    } as CatalogStats_Details)
                );
            });
    }, [data?.data, range]);

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
