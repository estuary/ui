import { useZustandStore } from 'context/Zustand/provider';
import { SelectTableStoreNames } from 'stores/names';
import { PrefixAlertTableState } from 'stores/Tables/PrefixAlerts/types';

export const usePrefixAlertTable_hydrateContinuously = () => {
    return useZustandStore<
        PrefixAlertTableState,
        PrefixAlertTableState['hydrateContinuously']
    >(
        SelectTableStoreNames.PREFIX_ALERTS,
        (state) => state.hydrateContinuously
    );
};

export const usePrefixAlertTable_setHydrated = () => {
    return useZustandStore<
        PrefixAlertTableState,
        PrefixAlertTableState['setHydrated']
    >(SelectTableStoreNames.PREFIX_ALERTS, (state) => state.setHydrated);
};

export const usePrefixAlertTable_setHydrationErrorsExist = () => {
    return useZustandStore<
        PrefixAlertTableState,
        PrefixAlertTableState['setHydrationErrorsExist']
    >(
        SelectTableStoreNames.PREFIX_ALERTS,
        (state) => state.setHydrationErrorsExist
    );
};
