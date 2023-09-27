import { Invoice } from 'api/billing';
import { useZustandStore } from 'context/Zustand/provider';
import { BillingState } from 'stores/Billing/types';
import { BillingStoreNames } from 'stores/names';
import { invoiceId } from 'utils/billing-utils';

// Selector Hooks
export const useBilling_invoicesInitialized = () => {
    return useZustandStore<BillingState, BillingState['invoicesInitialized']>(
        BillingStoreNames.GENERAL,
        (state) => state.invoicesInitialized
    );
};

export const useBilling_setInvoicesInitialized = () => {
    return useZustandStore<
        BillingState,
        BillingState['setInvoicesInitialized']
    >(BillingStoreNames.GENERAL, (state) => state.setInvoicesInitialized);
};

export const useBilling_invoices = () => {
    return useZustandStore<BillingState, BillingState['invoices']>(
        BillingStoreNames.GENERAL,
        (state) => state.invoices
    );
};

export const useBilling_setInvoices = () => {
    return useZustandStore<BillingState, BillingState['setInvoices']>(
        BillingStoreNames.GENERAL,
        (state) => state.setInvoices
    );
};

export const useBilling_updateInvoices = () => {
    return useZustandStore<BillingState, BillingState['updateInvoices']>(
        BillingStoreNames.GENERAL,
        (state) => state.updateInvoices
    );
};

export const useBilling_dataByTaskGraphDetails = () => {
    return useZustandStore<
        BillingState,
        BillingState['dataByTaskGraphDetails']
    >(BillingStoreNames.GENERAL, (state) => state.dataByTaskGraphDetails);
};

export const useBilling_setDataByTaskGraphDetails = () => {
    return useZustandStore<
        BillingState,
        BillingState['setDataByTaskGraphDetails']
    >(BillingStoreNames.GENERAL, (state) => state.setDataByTaskGraphDetails);
};

export const useBilling_hydrated = () => {
    return useZustandStore<BillingState, BillingState['hydrated']>(
        BillingStoreNames.GENERAL,
        (state) => state.hydrated
    );
};

export const useBilling_setHydrated = () => {
    return useZustandStore<BillingState, BillingState['setHydrated']>(
        BillingStoreNames.GENERAL,
        (state) => state.setHydrated
    );
};

export const useBilling_setHydrationErrorsExist = () => {
    return useZustandStore<
        BillingState,
        BillingState['setHydrationErrorsExist']
    >(BillingStoreNames.GENERAL, (state) => state.setHydrationErrorsExist);
};

export const useBilling_selectedTenant = () => {
    return useZustandStore<BillingState, BillingState['selectedTenant']>(
        BillingStoreNames.GENERAL,
        (state) => state.selectedTenant
    );
};

export const useBilling_setSelectedTenant = () => {
    return useZustandStore<BillingState, BillingState['setSelectedTenant']>(
        BillingStoreNames.GENERAL,
        (state) => state.setSelectedTenant
    );
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
