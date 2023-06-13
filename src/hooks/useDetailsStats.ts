import { getStatsForDetails } from 'api/stats';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { hasLength } from 'utils/misc-utils';

function useDetailsStats(catalogName: string) {
    const { data, error, mutate, isValidating } = useSelectNew(
        hasLength(catalogName) ? getStatsForDetails(catalogName) : null,
        extendedPollSettings
    );

    return {
        stats: data ? (data.data as any[]) : [],
        error,
        mutate,
        isValidating,
    };
}

export default useDetailsStats;
