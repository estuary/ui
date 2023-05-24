import { useZustandStore } from 'context/Zustand/provider';
import { GlobalStoreNames } from 'stores/names';
import { Schema } from 'types';
import { EntitiesState } from './types';

export const useEntitiesStore_setCapabilities = () => {
    return useZustandStore<EntitiesState, EntitiesState['setCapabilities']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.setCapabilities
    );
};

export const useEntitiesStore_prefixes = (
    kind: keyof EntitiesState['prefixes']
) => {
    return useZustandStore<EntitiesState, Schema>(
        GlobalStoreNames.ENTITIES,
        (state) => state.prefixes[kind]
    );
};

export const useEntitiesStore_prefixes_admin = () => {
    return useZustandStore<EntitiesState, Schema>(
        GlobalStoreNames.ENTITIES,
        (state) => state.prefixes.admin
    );
};

export const useEntitiesStore_prefixes_readable = () => {
    return useZustandStore<EntitiesState, Schema>(
        GlobalStoreNames.ENTITIES,
        (state) => {
            return {
                ...state.prefixes.admin,
                ...state.prefixes.read,
            };
        }
    );
};

export const useEntitiesStore_prefixes_writable = () => {
    return useZustandStore<EntitiesState, Schema>(
        GlobalStoreNames.ENTITIES,
        (state) => {
            return {
                ...state.prefixes.admin,
                ...state.prefixes.write,
            };
        }
    );
};

export const useEntitiesStore_hydrateState = () => {
    return useZustandStore<EntitiesState, EntitiesState['hydrateState']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.hydrateState
    );
};
export const useEntitiesStore_hydrated = () => {
    return useZustandStore<EntitiesState, EntitiesState['hydrated']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.hydrated
    );
};
export const useEntitiesStore_setHydrated = () => {
    return useZustandStore<EntitiesState, EntitiesState['setHydrated']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.setHydrated
    );
};
export const useEntitiesStore_hydrationErrors = () => {
    return useZustandStore<EntitiesState, EntitiesState['hydrationErrors']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.hydrationErrors
    );
};
export const useEntitiesStore_setHydrationErrors = () => {
    return useZustandStore<EntitiesState, EntitiesState['setHydrationErrors']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.setHydrationErrors
    );
};

export const useSidePanelDocsStore_resetState = () => {
    return useZustandStore<EntitiesState, EntitiesState['resetState']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.resetState
    );
};
