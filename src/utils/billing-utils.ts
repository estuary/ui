import type { Invoice } from 'src/api/billing';

import { format, parseISO } from 'date-fns';

export const TOTAL_CARD_HEIGHT = 300;

// Grid item height - 72 = graph canvas height
export const CARD_AREA_HEIGHT = TOTAL_CARD_HEIGHT - 72;

export const stripTimeFromDate = (date: string) => {
    const [truncatedDateStr] = date.split('T', 1);

    return parseISO(truncatedDateStr);
};

export const formatDateForApi = (date: Date) => {
    const fmt = "yyyy-MM-dd' 00:00:00+00'";

    return format(date, fmt);
};

export type InvoiceId = string;
export const invoiceId = (invoice: Invoice): InvoiceId => {
    return `${invoice.date_start}-${invoice.date_end}-${invoice.billed_prefix}`;
};
