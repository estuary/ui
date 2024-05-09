import { Invoice } from 'api/billing';
import { useZustandStore } from 'context/Zustand/provider';
import { BillingState } from 'stores/Billing/types';
import { BillingStoreNames } from 'stores/names';
import { invoiceId } from 'utils/billing-utils';

// Selector Hooks
export const useBilling_selectedInvoice = () => {
    return useZustandStore<BillingState, Invoice | null>(
        BillingStoreNames.GENERAL,
        (state) =>
            state.selectedInvoiceId
                ? state.invoices.find(
                      (inv) => invoiceId(inv) === state.selectedInvoiceId
                  ) ?? null
                : null
    );
};

export const useBilling_resetState = () => {
    return useZustandStore<BillingState, BillingState['resetState']>(
        BillingStoreNames.GENERAL,
        (state) => state.resetState
    );
};
