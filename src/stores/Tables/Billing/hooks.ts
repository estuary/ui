import { useZustandStore } from 'context/Zustand/provider';
import { SelectTableStoreNames } from 'stores/names';
import { BillingState } from 'stores/Tables/Billing/types';

// Selector Hooks
export const useBilling_setProjectedCostStats = () => {
    return useZustandStore<BillingState, BillingState['setProjectedCostStats']>(
        SelectTableStoreNames.BILLING,
        (state) => state.setProjectedCostStats
    );
};

export const useBilling_billingDetails = () => {
    return useZustandStore<BillingState, BillingState['billingDetails']>(
        SelectTableStoreNames.BILLING,
        (state) => state.billingDetails
    );
};

export const useBilling_setBillingDetails = () => {
    return useZustandStore<BillingState, BillingState['setBillingDetails']>(
        SelectTableStoreNames.BILLING,
        (state) => state.setBillingDetails
    );
};

export const useBilling_dataByTaskGraphDetails = () => {
    return useZustandStore<
        BillingState,
        BillingState['dataByTaskGraphDetails']
    >(SelectTableStoreNames.BILLING, (state) => state.dataByTaskGraphDetails);
};

export const useBilling_setDataByTaskGraphDetails = () => {
    return useZustandStore<
        BillingState,
        BillingState['setDataByTaskGraphDetails']
    >(
        SelectTableStoreNames.BILLING,
        (state) => state.setDataByTaskGraphDetails
    );
};

export const useBilling_hydrated = () => {
    return useZustandStore<BillingState, BillingState['hydrated']>(
        SelectTableStoreNames.BILLING,
        (state) => state.hydrated
    );
};

export const useBilling_resetState = () => {
    return useZustandStore<BillingState, BillingState['resetBillingState']>(
        SelectTableStoreNames.BILLING,
        (state) => state.resetBillingState
    );
};
