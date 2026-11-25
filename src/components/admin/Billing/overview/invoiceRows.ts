import type { ChipProps } from '@mui/material';
import type { Invoice, InvoiceLineItem } from 'src/api/gql/billing';

import {
    formatCents,
    formatDate,
    formatGb,
    formatMonth,
    formatMonthToDate,
    formatNumber,
    nextMonthStart,
} from 'src/components/admin/Billing/shared/format';
import { creditCents } from 'src/components/admin/Billing/shared/lineItems';

export interface InvoiceStatus {
    label: string;
    color: ChipProps['color'];
}

interface StatusContext {
    internal: boolean;
    // Invoices emailed to the billing contact are sent, not due.
    sendInvoice: boolean;
}

// `status` is the Stripe invoice's, and null when Stripe has no finalized
// invoice for the bill.
export function invoiceStatus(
    { invoiceType, status, subtotal }: Invoice,
    { internal, sendInvoice }: StatusContext
): InvoiceStatus | null {
    if (invoiceType === 'PREVIEW') {
        return { label: 'In progress', color: 'info' };
    }

    if (internal) {
        return { label: 'Not billed', color: 'default' };
    }

    if (subtotal <= 0) {
        return { label: 'No charge', color: 'default' };
    }

    switch (status) {
        case 'paid':
            return { label: 'Paid', color: 'success' };
        case 'open':
            return sendInvoice
                ? { label: 'Sent', color: 'primary' }
                : { label: 'Due', color: 'warning' };
        case 'void':
            return { label: 'Void', color: 'default' };
        case 'uncollectible':
            return { label: 'Uncollectible', color: 'error' };
        default:
            // A bill collected outside Stripe, as through a marketplace, has
            // no Stripe invoice.
            return invoiceType === 'FINAL' && !status
                ? { label: 'Issued', color: 'default' }
                : null;
    }
}

const lineItemsOf = (invoice: Invoice): InvoiceLineItem[] =>
    invoice.lineItems ?? [];

// Manual invoices are one-time charges named by their first line.
export const invoiceTitle = (invoice: Invoice) =>
    invoice.invoiceType === 'MANUAL'
        ? (lineItemsOf(invoice)[0]?.description ?? 'One-time charge')
        : formatMonth(invoice.dateStart);

export function invoiceSubtitle(invoice: Invoice, today: string) {
    if (invoice.invoiceType === 'MANUAL') {
        return `One-time · ${formatDate(invoice.dateStart)}`;
    }

    // This month's invoice runs through today.
    return invoice.invoiceType === 'PREVIEW' &&
        invoice.dateStart.slice(0, 7) === today.slice(0, 7)
        ? formatMonthToDate(today)
        : null;
}

// Usage invoices are issued on the first of the following month, and this
// month's isn't issued yet.
export function invoiceFootnote(invoice: Invoice) {
    const issued =
        invoice.invoiceType === 'MANUAL'
            ? invoice.dateStart
            : nextMonthStart(invoice.dateStart);
    const credits = creditCents(lineItemsOf(invoice));
    const gb = invoice.extra?.processed_data_gb;
    const hours = invoice.extra?.task_usage_hours;

    return [
        invoice.invoiceType === 'PREVIEW'
            ? null
            : `Issued ${formatDate(issued)}`,
        typeof gb === 'number' ? formatGb(gb) : null,
        typeof hours === 'number' ? `${formatNumber(hours)} task hours` : null,
        credits < 0 ? `${formatCents(credits)} credits` : null,
    ]
        .filter(Boolean)
        .join(' · ');
}
