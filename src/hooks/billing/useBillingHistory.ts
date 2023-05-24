import { BillingRecord, getBillingRecord } from 'api/billing';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { useBilling_selectedTenant } from 'stores/Billing/hooks';
import { hasLength } from 'utils/misc-utils';

const INTERVAL = 30000;

const defaultResponse: BillingRecord[] = [];

function useBillingHistory(currentMonth: string | Date) {
    const selectedTenant = useBilling_selectedTenant();

    const { data, error, mutate, isValidating } = useSelectNew<BillingRecord>(
        hasLength(selectedTenant)
            ? getBillingRecord(selectedTenant, currentMonth)
            : null,
        {
            errorRetryCount: 3,
            errorRetryInterval: INTERVAL / 2,
            refreshInterval: INTERVAL,
            revalidateOnFocus: false,
        }
    );

    return {
        billingHistory: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useBillingHistory;
