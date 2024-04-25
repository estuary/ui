import { Invoice, getInvoicesBetween } from 'api/billing';
import { extendedPollSettings } from 'context/SWR';
import { add } from 'date-fns';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { useTenantStore } from 'stores/Tenant/Store';
import { hasLength } from 'utils/misc-utils';

const defaultResponse: Invoice[] = [];

// TODO (typing): Correct the return type of useSelectNew. In this instance, data is an object and not an array.
function useInvoice(currentMonth: Date) {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { data, error, mutate, isValidating } = useSelectNew<Invoice>(
        hasLength(selectedTenant)
            ? getInvoicesBetween(
                  selectedTenant,
                  currentMonth,
                  add(currentMonth, { months: 1 })
              )
            : null,
        extendedPollSettings
    );

    return {
        invoices: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useInvoice;
