import { useZustandStore } from 'context/Zustand/provider';
import { AdminStoreNames } from 'stores/names';
import { StorageMappingsState } from './types';

export const useStorageMappingsStore_spec = () => {
    return useZustandStore<StorageMappingsState, StorageMappingsState['spec']>(
        AdminStoreNames.STORAGE_MAPPINGS,
        (state) => state.spec
    );
};

export const useStorageMappingsStore_hydrate = () => {
    return useZustandStore<
        StorageMappingsState,
        StorageMappingsState['hydrate']
    >(AdminStoreNames.STORAGE_MAPPINGS, (state) => state.hydrate);
};

export const useStorageMappingsStore_loading = () => {
    return useZustandStore<
        StorageMappingsState,
        StorageMappingsState['loading']
    >(AdminStoreNames.STORAGE_MAPPINGS, (state) => state.loading);
};
