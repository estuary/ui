import { useZustandStore } from 'context/Zustand/provider';
import { SelectTableStoreNames } from 'stores/names';
import { BillingTableState } from 'stores/Tables/Billing/types';

// Selector Hooks
export const useBillingTable_hydrateContinuously = () => {
    return useZustandStore<
        BillingTableState,
        BillingTableState['hydrateContinuously']
    >(SelectTableStoreNames.BILLING, (state) => state.hydrateContinuously);
};

export const useBillingTable_setHydrated = () => {
    return useZustandStore<BillingTableState, BillingTableState['setHydrated']>(
        SelectTableStoreNames.BILLING,
        (state) => state.setHydrated
    );
};

export const useBillingTable_setHydrationErrorsExist = () => {
    return useZustandStore<
        BillingTableState,
        BillingTableState['setHydrationErrorsExist']
    >(SelectTableStoreNames.BILLING, (state) => state.setHydrationErrorsExist);
};
