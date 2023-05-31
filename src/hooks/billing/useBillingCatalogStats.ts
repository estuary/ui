import { getStatsForBilling } from 'api/stats';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import {
    useBilling_billingHistory,
    useBilling_billingHistoryInitialized,
    useBilling_selectedTenant,
} from 'stores/Billing/hooks';
import { CatalogStats_Billing } from 'types';
import { hasLength } from 'utils/misc-utils';

function useBillingCatalogStats() {
    const selectedTenant = useBilling_selectedTenant();
    const historyInitialized = useBilling_billingHistoryInitialized();
    const billingHistory = useBilling_billingHistory();

    const { data, error, mutate, isValidating } = useSelectNew(
        hasLength(selectedTenant) && hasLength(billingHistory)
            ? getStatsForBilling(
                  [selectedTenant],
                  billingHistory[0].billed_month
              )
            : null,
        extendedPollSettings
    );

    const defaultResponse = historyInitialized ? [] : null;

    return {
        billingStats: data
            ? (data.data as CatalogStats_Billing[])
            : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useBillingCatalogStats;
