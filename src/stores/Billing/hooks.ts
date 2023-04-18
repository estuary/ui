import { useZustandStore } from 'context/Zustand/provider';
import { BillingState } from 'stores/Billing/types';
import { BillingStoreNames } from 'stores/names';

// Selector Hooks
export const useBilling_billingHistory = () => {
    return useZustandStore<BillingState, BillingState['billingHistory']>(
        BillingStoreNames.GENERAL,
        (state) => state.billingHistory
    );
};

export const useBilling_setBillingHistory = () => {
    return useZustandStore<BillingState, BillingState['setBillingHistory']>(
        BillingStoreNames.GENERAL,
        (state) => state.setBillingHistory
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

export const useBilling_resetState = () => {
    return useZustandStore<BillingState, BillingState['resetState']>(
        BillingStoreNames.GENERAL,
        (state) => state.resetState
    );
};
