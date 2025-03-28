import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { getStatsForBilling } from 'src/api/stats';
import { useBillingStore } from 'src/stores/Billing/Store';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { CatalogStats_Billing } from 'src/types';
import { hasLength } from 'src/utils/misc-utils';

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
