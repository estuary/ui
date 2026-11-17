import type { Invoice } from 'src/api/gql/billing';

import { parseISO } from 'date-fns';

export const TOTAL_CARD_HEIGHT = 300;

// Grid item height - 72 = graph canvas height
export const CARD_AREA_HEIGHT = TOTAL_CARD_HEIGHT - 72;

export const USAGE_GRAPH_MONTHS = 6;

export const stripTimeFromDate = (date: string) => {
    const [truncatedDateStr] = date.split('T', 1);

    return parseISO(truncatedDateStr);
};

export type InvoiceId = string;
export const invoiceId = (invoice: Invoice): InvoiceId => {
    return `${invoice.dateStart}-${invoice.dateEnd}-${invoice.invoiceType}`;
};
