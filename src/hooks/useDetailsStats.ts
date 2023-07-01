import { getStatsForDetails } from 'api/stats';
import { DataByHourRange } from 'components/graphs/types';
import { useEntityType } from 'context/EntityContext';
import { formatInTimeZone } from 'date-fns-tz';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { useEffect, useState } from 'react';
import { useInterval, useList } from 'react-use';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

function useDetailsStats(catalogName: string, range: DataByHourRange) {
    const entityType = useEntityType();

    const [localRange, setLocalRange] = useState<DataByHourRange | undefined>(
        range
    );

    const [detailsStats, { set, insertAt }] = useList<any>([]);

    const { data, error, mutate, isValidating } = useSelectNew(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType, localRange)
            : null
    );

    useInterval(async () => {
        console.log('calling mutate');
        setLocalRange(undefined);
        await mutate();
    }, 15000);

    useEffect(() => {
        console.log('Range changed so updating');
        setLocalRange(range);
    }, [range]);

    useEffect(() => {
        if (!isValidating && data?.data) {
            if (data.data.length > 1) {
                console.log('setting the state', { data });
                set(data.data);
            } else {
                console.log('updating the state', { data });
                const freshData = data.data[0] as Schema;

                const ts = formatInTimeZone(
                    new Date(),
                    'GMT',
                    `yyyy-MM-dd HH:mm:ssxxx`
                ).replace(' ', 'T');

                console.log('timeZonedCurretTime', ts);

                insertAt(0, {
                    ...freshData,
                    ts,
                });
            }
        }
    }, [isValidating, data, insertAt, set]);

    return {
        stats: detailsStats,
        error,
        mutate,
        isValidating,
    };
}

export default useDetailsStats;
