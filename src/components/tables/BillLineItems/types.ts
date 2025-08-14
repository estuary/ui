import type { ReactNode } from 'react';
import type { InvoiceLineItem } from 'src/api/billing';

export interface RowProps {
    row: InvoiceLineItem;
    descriptionTooltip: ReactNode | null;
}

export interface RowsProps {
    lineItems: InvoiceLineItem[];
}
