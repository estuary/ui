import { getStatsForBilling } from 'api/stats';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { ProjectedCostStats } from 'types';
import { hasLength } from 'utils/misc-utils';

const INTERVAL = 30000;

const defaultResponse: ProjectedCostStats[] = [];

function useProjectedCostStats() {
    const { combinedGrants } = useCombinedGrantsExt({ adminOnly: true });

    const { data, error, mutate, isValidating } = useSelectNew(
        hasLength(combinedGrants) ? getStatsForBilling(combinedGrants) : null,
        {
            errorRetryCount: 3,
            errorRetryInterval: INTERVAL / 2,
            refreshInterval: INTERVAL,
            revalidateOnFocus: false,
        }
    );

    return {
        projectedCostStats: data
            ? (data.data as ProjectedCostStats[])
            : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useProjectedCostStats;
