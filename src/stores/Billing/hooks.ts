import { Invoice } from 'api/billing';
import { useZustandStore } from 'context/Zustand/provider';
import { BillingState } from 'stores/Billing/types';
import { BillingStoreNames } from 'stores/names';
import { invoiceId } from 'utils/billing-utils';

// Selector Hooks
export const useBilling_setHydrated = () => {
    return useZustandStore<BillingState, BillingState['setHydrated']>(
        BillingStoreNames.GENERAL,
        (state) => state.setHydrated
    );
};

export const useBilling_setActive = () => {
    return useZustandStore<BillingState, BillingState['setActive']>(
        BillingStoreNames.GENERAL,
        (state) => state.setActive
    );
};

export const useBilling_networkFailed = () => {
    return useZustandStore<BillingState, BillingState['networkFailed']>(
        BillingStoreNames.GENERAL,
        (state) => state.networkFailed
    );
};

export const useBilling_setNetworkFailed = () => {
    return useZustandStore<BillingState, BillingState['setNetworkFailed']>(
        BillingStoreNames.GENERAL,
        (state) => state.setNetworkFailed
    );
};

export const useBilling_setHydrationErrorsExist = () => {
    return useZustandStore<
        BillingState,
        BillingState['setHydrationErrorsExist']
    >(BillingStoreNames.GENERAL, (state) => state.setHydrationErrorsExist);
};

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
