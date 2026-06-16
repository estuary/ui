import type { Invoice } from 'src/api/billing';

import { useMemo } from 'react';
import useConstant from 'use-constant';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

import { getInvoicesBetween } from 'src/api/billing';
import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';
import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';
import { invoiceId } from 'src/utils/billing-utils';

export interface UseBillingInvoicesResult {
    invoices: Invoice[];
    // The invoice currently shown in the line-item/detail views: the stored
    // selection if it still exists in this tenant's data, otherwise the newest
    // invoice. Falling back this way means an org switch self-corrects without
    // anyone resetting state.
    selectedInvoice: Invoice | null;
    isLoading: boolean;
    networkFailed: boolean;
    errorExists: boolean;
}

// Fetches the selected tenant's invoices for a rolling six-month window. The
// SWR key derives from the query (tenant + dates), so switching tenants
// re-fetches automatically and the previous tenant's data is never shown.
// Because `formatDateForApi` is day-granular, every component that calls this
// hook on a given day produces the same key and shares a single request.
export function useBillingInvoices(): UseBillingInvoicesResult {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const selectedInvoiceId = useBillingStore(
        (state) => state.selectedInvoiceId
    );

    const dateRange = useConstant(() => {
        const end = endOfMonth(new Date());

        return { start: startOfMonth(subMonths(end, 5)), end };
    });

    const query = useMemo(
        () =>
            selectedTenant
                ? getInvoicesBetween(
                      selectedTenant,
                      dateRange.start,
                      dateRange.end
                  )
                : null,
        [dateRange.end, dateRange.start, selectedTenant]
    );

    const { data, error, isLoading } = useQuery(query);

    const invoices = useMemo(() => data ?? [], [data]);

    const selectedInvoice = useMemo(() => {
        if (invoices.length === 0) {
            return null;
        }

        return (
            invoices.find(
                (invoice) => invoiceId(invoice) === selectedInvoiceId
            ) ?? invoices[0]
        );
    }, [invoices, selectedInvoiceId]);

    return {
        invoices,
        selectedInvoice,
        isLoading,
        networkFailed: checkErrorMessage(FAILED_TO_FETCH, error?.message),
        errorExists: Boolean(error),
    };
}
