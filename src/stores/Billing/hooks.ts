import { useBillingStore } from './Store';

import { invoiceId } from 'src/utils/billing-utils';

// Selector Hooks
export const useBilling_selectedInvoice = () => {
    return useBillingStore((state) =>
        state.selectedInvoiceId
            ? (state.invoices.find(
                  (inv) => invoiceId(inv) === state.selectedInvoiceId
              ) ?? null)
            : null
    );
};
