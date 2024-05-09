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

export const useBilling_setSelectedInvoice = () => {
    return useZustandStore<BillingState, BillingState['setSelectedInvoice']>(
        BillingStoreNames.GENERAL,
        (state) => state.setSelectedInvoice
    );
};

export const useBilling_paymentMethodExists = () => {
    return useZustandStore<BillingState, BillingState['paymentMethodExists']>(
        BillingStoreNames.GENERAL,
        (state) => state.paymentMethodExists
    );
};

export const useBilling_setPaymentMethodExists = () => {
    return useZustandStore<
        BillingState,
        BillingState['setPaymentMethodExists']
    >(BillingStoreNames.GENERAL, (state) => state.setPaymentMethodExists);
};

export const useBilling_resetState = () => {
    return useZustandStore<BillingState, BillingState['resetState']>(
        BillingStoreNames.GENERAL,
        (state) => state.resetState
    );
};
