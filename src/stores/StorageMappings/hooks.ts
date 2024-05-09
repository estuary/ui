import { useStorageMappingsStore } from './Store';

export const useStorageMappingsStore_loading = () => {
    return useStorageMappingsStore((state) => state.loading);
};
