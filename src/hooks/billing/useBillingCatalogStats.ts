import { getStatsForBilling } from 'api/stats';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import {
    useBilling_billingHistory,
    useBilling_selectedTenant,
} from 'stores/Billing/hooks';
import { CatalogStats_Billing } from 'types';
import { hasLength } from 'utils/misc-utils';

const INTERVAL = 30000;

function useBillingCatalogStats() {
    const selectedTenant = useBilling_selectedTenant();
    const billingHistory = useBilling_billingHistory();

    const { data, error, mutate, isValidating } = useSelectNew(
        hasLength(selectedTenant) && hasLength(billingHistory)
            ? getStatsForBilling(
                  [selectedTenant],
                  billingHistory[0].billed_month
              )
            : null,
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
