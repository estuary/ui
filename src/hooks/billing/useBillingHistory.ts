import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { useBilling_selectedTenant } from 'stores/Billing/hooks';
import { BillingRecord } from 'stores/Billing/types';
import { CatalogStats_Billing } from 'types';
import { formatBillingCatalogStats } from 'utils/billing-utils';
import { hasLength } from 'utils/misc-utils';

interface Props {
    query: PostgrestFilterBuilder<CatalogStats_Billing>;
}

const INTERVAL = 30000;

const defaultResponse: BillingRecord[] = [];

function useBillingHistory({ query }: Props) {
    const selectedTenant = useBilling_selectedTenant();

    const { data, error, mutate, isValidating } =
        useSelectNew<CatalogStats_Billing>(
            hasLength(selectedTenant) ? query : null,
            {
                errorRetryCount: 3,
                errorRetryInterval: INTERVAL / 2,
                refreshInterval: INTERVAL,
                revalidateOnFocus: false,
            }
        );

    return {
        billingHistory: data
            ? formatBillingCatalogStats(data.data)
            : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useBillingHistory;
