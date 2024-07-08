import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { Invoice, getInvoicesBetween } from 'api/billing';
import { extendedPollSettings } from 'context/SWR';
import { add } from 'date-fns';
import { useTenantStore } from 'stores/Tenant/Store';
import { hasLength } from 'utils/misc-utils';

const defaultResponse: Invoice[] = [];

function useInvoice(currentMonth: Date) {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { data, error, mutate, isValidating } = useQuery(
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
        invoices: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useInvoice;
