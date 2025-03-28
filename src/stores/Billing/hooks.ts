import { invoiceId } from 'src/utils/billing-utils';
import { useBillingStore } from 'src/stores/Billing/Store';


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
