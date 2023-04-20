import { useZustandStore } from 'context/Zustand/provider';
import { SelectTableStoreNames } from 'stores/names';
import { BillingState } from 'stores/Tables/Billing/types';

// Selector Hooks
export const useBilling_hydrateContinuously = () => {
    return useZustandStore<BillingState, BillingState['hydrateContinuously']>(
        SelectTableStoreNames.BILLING,
        (state) => state.hydrateContinuously
    );
};
