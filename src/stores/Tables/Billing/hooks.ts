import { useZustandStore } from 'context/Zustand/provider';
import { SelectTableStoreNames } from 'stores/names';
import { BillingState } from 'stores/Tables/Billing/types';

// Selector Hooks
export const useBilling_projectedCostStats = () => {
    return useZustandStore<BillingState, BillingState['projectedCostStats']>(
        SelectTableStoreNames.BILLING,
        (state) => state.projectedCostStats
    );
};

export const useBilling_setProjectedCostStats = () => {
    return useZustandStore<BillingState, BillingState['setProjectedCostStats']>(
        SelectTableStoreNames.BILLING,
        (state) => state.setProjectedCostStats
    );
};

export const useBilling_setBillingDetails = () => {
    return useZustandStore<BillingState, BillingState['setBillingDetails']>(
        SelectTableStoreNames.BILLING,
        (state) => state.setBillingDetails
    );
};
