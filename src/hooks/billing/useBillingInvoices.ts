import type { Invoice, InvoiceLineItem } from 'src/api/billing';
import type { TenantBillingInvoicesQuery } from 'src/gql-types/graphql';
import type { InvoiceId } from 'src/utils/billing-utils';

import { useMemo } from 'react';
import useConstant from 'use-constant';

import {
    compareDesc,
    endOfMonth,
    isWithinInterval,
    startOfMonth,
    subMonths,
} from 'date-fns';

import {
    BILLING_INVOICE_PAGE_SIZE,
    TENANT_BILLING_INVOICES_QUERY,
} from 'src/api/gql/billing';
import { useAllPages } from 'src/api/gql/useAllPages';
import { useTenantStore } from 'src/stores/Tenant';
import { invoiceId, stripTimeFromDate } from 'src/utils/billing-utils';

export interface UseBillingInvoicesResult {
    invoices: Invoice[];
    // The invoice currently shown in the line-item/detail views: the requested
    // selection if it still exists in this tenant's data, otherwise the newest
    // invoice. Falling back this way means an org switch self-corrects without
    // anyone resetting state.
    selectedInvoice: Invoice | null;
    isLoading: boolean;
    networkFailed: boolean;
    errorExists: boolean;
}

type InvoiceNode = NonNullable<
    TenantBillingInvoicesQuery['tenant']
>['billing']['invoices']['edges'][number]['node'];

interface DateWindow {
    start: Date;
    end: Date;
}

// The GQL invoice node is camelCased and omits `billed_prefix` (the tenant is
// the query parent). Map it back to the shape the billing UI already consumes.
const mapInvoice = (node: InvoiceNode, tenant: string): Invoice => ({
    billed_prefix: tenant,
    date_start: node.dateStart,
    date_end: node.dateEnd,
    invoice_type: node.invoiceType.toLowerCase() as Invoice['invoice_type'],
    subtotal: node.subtotal,
    line_items: (node.lineItems ?? []) as InvoiceLineItem[],
    extra: (node.extra ?? undefined) as Invoice['extra'],
});

// Mirrors the predicate the previous PostgREST query enforced server-side:
// invoices whose start and end both fall inside the rolling window, plus any
// manual invoice regardless of date.
const isVisible = (invoice: Invoice, { start, end }: DateWindow): boolean => {
    if (invoice.invoice_type === 'manual') {
        return true;
    }

    return (
        isWithinInterval(stripTimeFromDate(invoice.date_start), {
            start,
            end,
        }) &&
        isWithinInterval(stripTimeFromDate(invoice.date_end), { start, end })
    );
};

// Read every page before applying the window: older manual invoices must remain visible.
export function useBillingInvoices(
    selectedInvoiceId: InvoiceId | null = null
): UseBillingInvoicesResult {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const dateWindow = useConstant<DateWindow>(() => {
        const end = endOfMonth(new Date());

        return { start: startOfMonth(subMonths(end, 5)), end };
    });

    const { data, loading, error } = useAllPages(
        TENANT_BILLING_INVOICES_QUERY,
        {
            variables: {
                tenant: selectedTenant,
                first: BILLING_INVOICE_PAGE_SIZE,
            },
            pause: !selectedTenant,
            getConnection: (result) =>
                result.tenant?.name === selectedTenant
                    ? result.tenant.billing.invoices
                    : { edges: [], pageInfo: { hasNextPage: false } },
            transform: (node) => mapInvoice(node, selectedTenant),
        }
    );

    const invoices = useMemo(() => {
        return data
            .filter((invoice) => isVisible(invoice, dateWindow))
            .sort((a, b) =>
                compareDesc(
                    stripTimeFromDate(a.date_start),
                    stripTimeFromDate(b.date_start)
                )
            );
    }, [data, dateWindow]);

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
        isLoading: loading,
        networkFailed: Boolean(error?.networkError),
        errorExists: Boolean(error),
    };
}
