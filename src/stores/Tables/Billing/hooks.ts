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

export const useBilling_billingHistory = () => {
    return useZustandStore<BillingState, BillingState['billingHistory']>(
        SelectTableStoreNames.BILLING,
        (state) => state.billingHistory
    );
};

export const useBilling_setBillingHistory = () => {
    return useZustandStore<BillingState, BillingState['setBillingHistory']>(
        SelectTableStoreNames.BILLING,
        (state) => state.setBillingHistory
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

export const useBilling_hydrateContinuously = () => {
    return useZustandStore<BillingState, BillingState['hydrateContinuously']>(
        SelectTableStoreNames.BILLING,
        (state) => state.hydrateContinuously
    );
};

export const useBilling_resetState = () => {
    return useZustandStore<BillingState, BillingState['resetBillingState']>(
        SelectTableStoreNames.BILLING,
        (state) => state.resetBillingState
    );
};
