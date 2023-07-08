import { DetailsStats, getStatsForDetails } from 'api/stats';
import { DataByHourRange } from 'components/graphs/types';
import { useEntityType } from 'context/EntityContext';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { hasLength } from 'utils/misc-utils';

function useDetailsStats(catalogName: string, range: DataByHourRange) {
    const entityType = useEntityType();

    const { data, error, isValidating } = useSelectNew<DetailsStats>(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType, 'hourly', {
                  hours: range,
              })
            : null,
        {
            refreshInterval: 15000,
        }
    );

    return {
        stats: data ? data.data : [],
        error,
        isValidating,
    };
}

export default useDetailsStats;
