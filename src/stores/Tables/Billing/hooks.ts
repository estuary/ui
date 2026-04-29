import type { BillingTableState } from 'src/stores/Tables/Billing/types';

import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';

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
