import { invoiceId } from 'src/utils/billing-utils';
import { useBillingStore } from './Store';

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
