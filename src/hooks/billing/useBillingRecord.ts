import { BillingRecord, getBillingRecord } from 'api/billing';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { useBilling_selectedTenant } from 'stores/Billing/hooks';
import { hasLength } from 'utils/misc-utils';

const defaultResponse: BillingRecord[] = [];

// TODO (typing): Correct the return type of useSelectNew. In this instance, data is an object and not an array.
function useBillingRecord(currentMonth: string | Date) {
    const selectedTenant = useBilling_selectedTenant();

    const { data, error, mutate, isValidating } = useSelectNew<BillingRecord>(
        hasLength(selectedTenant)
            ? getBillingRecord(selectedTenant, currentMonth)
            : null,
        extendedPollSettings
    );

    return {
        billingRecord: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useBillingRecord;
