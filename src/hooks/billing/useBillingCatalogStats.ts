import { getStatsForBilling } from 'api/stats';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import {
    useBilling_invoices,
    useBilling_invoicesInitialized,
} from 'stores/Billing/hooks';
import { useTenantStore } from 'stores/Tenant/Store';
import { CatalogStats_Billing } from 'types';
import { hasLength } from 'utils/misc-utils';

function useBillingCatalogStats() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const historyInitialized = useBilling_invoicesInitialized();
    const invoices = useBilling_invoices();

    const { data, error, mutate, isValidating } = useSelectNew(
        hasLength(selectedTenant) && hasLength(invoices)
            ? getStatsForBilling([selectedTenant], invoices[0].date_start)
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
