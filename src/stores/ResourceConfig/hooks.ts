import { useZustandStore } from 'context/Zustand/provider';
import { ResourceConfigStoreNames } from 'stores/names';
import { ResourceConfigState } from './types';

// Selector Hooks
export const useResourceConfig_resetState = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.resetState);
};
