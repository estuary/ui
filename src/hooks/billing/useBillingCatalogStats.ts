import type { CatalogStats_Billing } from 'types';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getStatsForBilling } from 'api/stats';
import { useBillingStore } from 'stores/Billing/Store';
import { useTenantStore } from 'stores/Tenant/Store';
import { hasLength } from 'utils/misc-utils';

const defaultResponse: CatalogStats_Billing[] = [];
const loadingResponse = null;

function useBillingCatalogStats() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const historyInitialized = useBillingStore(
        (state) => state.invoicesInitialized
    );
    const invoices = useBillingStore((state) => state.invoices);

    const { data, error, mutate, isValidating } = useQuery(
        hasLength(selectedTenant) && hasLength(invoices)
            ? getStatsForBilling(selectedTenant, invoices[0].date_start)
            : null
    );

    return {
        billingStats:
            data ?? (historyInitialized ? defaultResponse : loadingResponse),
        error,
        mutate,
        isValidating,
    };
}

export default useBillingCatalogStats;
