import { getStatsForBilling } from 'api/stats';
import { singleCallSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { ProjectedCostStats } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    singleCall?: boolean;
}

const defaultResponse: ProjectedCostStats[] = [];

function useProjectCostStats({ singleCall }: Props) {
    const { combinedGrants } = useCombinedGrantsExt({ adminOnly: true });

    const { data, error, mutate, isValidating } = useSelectNew(
        hasLength(combinedGrants) ? getStatsForBilling(combinedGrants) : null,
        singleCall ? singleCallSettings : undefined
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

export default useProjectCostStats;
