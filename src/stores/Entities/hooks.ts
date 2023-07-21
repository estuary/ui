import { useEffect } from 'react';

import useSWR from 'swr';
import { Schema } from 'types';

import { singleCallSettings } from 'context/SWR';
import { useZustandStore } from 'context/Zustand/provider';

import { GlobalStoreNames } from 'stores/names';

import { EntitiesState } from './types';

export const useEntitiesStore_setCapabilities = () => {
    return useZustandStore<EntitiesState, EntitiesState['setCapabilities']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.setCapabilities
    );
};

export const useEntitiesStore_capabilities = (
    kind: keyof EntitiesState['capabilities']
) => {
    return useZustandStore<EntitiesState, Schema>(
        GlobalStoreNames.ENTITIES,
        (state) => state.capabilities[kind]
    );
};

export const useEntitiesStore_capabilities_adminable = () => {
    return useZustandStore<EntitiesState, Schema>(
        GlobalStoreNames.ENTITIES,
        (state) => state.capabilities.admin
    );
};

export const useEntitiesStore_capabilities_readable = () => {
    return useZustandStore<EntitiesState, Schema>(
        GlobalStoreNames.ENTITIES,
        (state) => {
            return {
                ...state.capabilities.admin,
                ...state.capabilities.write,
                ...state.capabilities.read,
            };
        }
    );
};

export const useEntitiesStore_capabilities_writable = () => {
    return useZustandStore<EntitiesState, Schema>(
        GlobalStoreNames.ENTITIES,
        (state) => {
            return {
                ...state.capabilities.admin,
                ...state.capabilities.write,
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
export const useEntitiesStore_mutate = () => {
    return useZustandStore<EntitiesState, EntitiesState['mutate']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.mutate
    );
};
const useEntitiesStore_setMutate = () => {
    return useZustandStore<EntitiesState, EntitiesState['setMutate']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.setMutate
    );
};

export const useSidePanelDocsStore_resetState = () => {
    return useZustandStore<EntitiesState, EntitiesState['resetState']>(
        GlobalStoreNames.ENTITIES,
        (state) => state.resetState
    );
};

// We hardcode the key here as we only call once
export const useHydrateState = () => {
    const hydrateState = useEntitiesStore_hydrateState();

    const response = useSWR(
        'entities_hydrator',
        () => {
            return hydrateState();
        },
        singleCallSettings
    );

    // The rest of the stuff we need to handle hydration
    const setHydrationErrors = useEntitiesStore_setHydrationErrors();
    const setCapabilities = useEntitiesStore_setCapabilities();
    const setHydrated = useEntitiesStore_setHydrated();
    const setMutate = useEntitiesStore_setMutate();

    // Once we are done validating update all the settings
    useEffect(() => {
        if (!response.isValidating) {
            setHydrationErrors(response.error);
            setCapabilities(response.data?.data ?? null);
            setMutate(response.mutate);
            setHydrated(true);
        }
    }, [
        response.data?.data,
        response.error,
        response.isValidating,
        response.mutate,
        setCapabilities,
        setHydrated,
        setHydrationErrors,
        setMutate,
    ]);

    return response;
};
