import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getStatsForBilling } from 'api/stats';
import { extendedPollSettings } from 'context/SWR';
import { useBillingStore } from 'stores/Billing/Store';
import { useTenantStore } from 'stores/Tenant/Store';
import { hasLength } from 'utils/misc-utils';

function useBillingCatalogStats() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const historyInitialized = useBillingStore(
        (state) => state.invoicesInitialized
    );
    const invoices = useBillingStore((state) => state.invoices);

    const { data, error, mutate, isValidating } = useQuery(
        hasLength(selectedTenant) && hasLength(invoices)
            ? getStatsForBilling([selectedTenant], invoices[0].date_start)
            : null,
        extendedPollSettings
    );

    return {
        billingStats: data ?? historyInitialized ? [] : null,
        error,
        mutate,
        isValidating,
    };
}

export default useBillingCatalogStats;
