import type { Invoice, InvoiceLineItem } from 'src/api/billing';

import { useMemo } from 'react';
import useConstant from 'use-constant';

import {
    compareDesc,
    endOfMonth,
    isWithinInterval,
    startOfMonth,
    subMonths,
} from 'date-fns';
import { useQuery } from 'urql';

import {
    BILLING_INVOICE_FETCH_LIMIT,
    TENANT_BILLING_INVOICES_QUERY,
} from 'src/api/gql/billing';
import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';
import { invoiceId, stripTimeFromDate } from 'src/utils/billing-utils';

export interface UseBillingInvoicesResult {
    // The rolling-window subset (plus manual invoices) used by the usage
    // graphs, which only chart the recent period.
    invoices: Invoice[];
    // Every invoice for the tenant, newest first. Drives the full, paginated
    // history table.
    allInvoices: Invoice[];
    // The invoice currently shown in the line-item/detail views: the stored
    // selection if it still exists in this tenant's data, otherwise the newest
    // invoice. Falling back this way means an org switch self-corrects without
    // anyone resetting state.
    selectedInvoice: Invoice | null;
    isLoading: boolean;
    networkFailed: boolean;
    errorExists: boolean;
}

interface DateWindow {
    start: Date;
    end: Date;
}

// The GQL invoice node is camelCased and omits `billed_prefix` (the tenant is
// the query parent). Map it back to the shape the billing UI already consumes.
const mapInvoice = (
    node: {
        dateStart: string;
        dateEnd: string;
        invoiceType: string;
        subtotal: number;
        lineItems: unknown;
        extra: unknown;
        status?: string | null;
        invoicePdf?: string | null;
        hostedInvoiceUrl?: string | null;
        paymentDetails?: { receiptUrl?: string | null } | null;
    },
    tenant: string
): Invoice => ({
    billed_prefix: tenant,
    date_start: node.dateStart,
    date_end: node.dateEnd,
    invoice_type: node.invoiceType.toLowerCase() as Invoice['invoice_type'],
    subtotal: node.subtotal,
    line_items: (node.lineItems ?? []) as InvoiceLineItem[],
    extra: (node.extra ?? undefined) as Invoice['extra'],
    status: node.status,
    invoice_pdf: node.invoicePdf,
    hosted_invoice_url: node.hostedInvoiceUrl,
    receipt_url: node.paymentDetails?.receiptUrl ?? null,
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

// Fetches the selected tenant's invoices via GraphQL. urql keys its cache on
// the query variables, so switching tenants re-runs the query and a previously
// viewed tenant is served from cache — the previous tenant's data is never
// shown. Server-side filtering on `billing.invoices` is narrower than the old
// PostgREST query (no "window OR manual" predicate), so the window/manual
// filter and newest-first sort are reproduced here.
export function useBillingInvoices(): UseBillingInvoicesResult {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const selectedInvoiceId = useBillingStore(
        (state) => state.selectedInvoiceId
    );

    const dateWindow = useConstant<DateWindow>(() => {
        const end = endOfMonth(new Date());

        return { start: startOfMonth(subMonths(end, 5)), end };
    });

    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_INVOICES_QUERY,
        variables: {
            tenant: selectedTenant,
            first: BILLING_INVOICE_FETCH_LIMIT,
        },
        pause: !selectedTenant,
    });

    const allInvoices = useMemo(() => {
        const nodes = data?.tenant?.billing.invoices.nodes ?? [];

        return nodes
            .map((node) => mapInvoice(node, selectedTenant))
            .sort((a, b) =>
                compareDesc(
                    stripTimeFromDate(a.date_start),
                    stripTimeFromDate(b.date_start)
                )
            );
    }, [data, selectedTenant]);

    const invoices = useMemo(
        () => allInvoices.filter((invoice) => isVisible(invoice, dateWindow)),
        [allInvoices, dateWindow]
    );

    const selectedInvoice = useMemo(() => {
        if (allInvoices.length === 0) {
            return null;
        }

        return (
            allInvoices.find(
                (invoice) => invoiceId(invoice) === selectedInvoiceId
            ) ?? allInvoices[0]
        );
    }, [allInvoices, selectedInvoiceId]);

    return {
        invoices,
        allInvoices,
        selectedInvoice,
        isLoading: fetching,
        networkFailed: Boolean(error?.networkError),
        errorExists: Boolean(error),
    };
}
