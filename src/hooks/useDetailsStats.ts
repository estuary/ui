import { getStatsForDetails } from 'api/stats';
import { useEntityType } from 'context/EntityContext';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { hasLength } from 'utils/misc-utils';

function useDetailsStats(catalogName: string) {
    const entityType = useEntityType();

    const { data, error, mutate, isValidating } = useSelectNew(
        hasLength(catalogName)
            ? getStatsForDetails(catalogName, entityType)
            : null,
        {
            ...extendedPollSettings,
            // , refreshInterval: 5000
        }
    );

    return {
        stats: data ? (data.data as any[]) : [],
        error,
        mutate,
        isValidating,
    };
}

export default useDetailsStats;
