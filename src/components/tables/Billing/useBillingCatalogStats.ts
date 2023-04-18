import { getStatsForBilling } from 'api/stats';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { CatalogStats_Billing } from 'types';
import { hasLength } from 'utils/misc-utils';

const INTERVAL = 30000;

function useBillingCatalogStats() {
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
        billingStats: data ? (data.data as CatalogStats_Billing[]) : null,
        error,
        mutate,
        isValidating,
    };
}

export default useBillingCatalogStats;
