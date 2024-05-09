import { useStorageMappingsStore } from './Store';

export const useStorageMappingsStore_hydrate = () => {
    return useStorageMappingsStore((state) => state.hydrate);
};

export const useStorageMappingsStore_loading = () => {
    return useStorageMappingsStore((state) => state.loading);
};
