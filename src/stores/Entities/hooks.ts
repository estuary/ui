import { singleCallSettings } from 'context/SWR';
import { useEffect } from 'react';
import useSWR from 'swr';
import { ESTUARY_SUPPORT_ROLE } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';
import { useEntitiesStore } from './Store';
import { EntitiesState } from './types';

export const useEntitiesStore_setCapabilities = () => {
    return useEntitiesStore((state) => state.setCapabilities);
};

export const useEntitiesStore_capabilities = (
    kind: keyof EntitiesState['capabilities']
) => {
    return useEntitiesStore((state) => state.capabilities[kind]);
};

export const useEntitiesStore_hasSupportRole = () => {
    return useEntitiesStore(
        useShallow((state) =>
            Boolean(state.capabilities.admin[ESTUARY_SUPPORT_ROLE])
        )
    );
};

export const useEntitiesStore_capabilities_adminable = () => {
    return useEntitiesStore((state) => state.capabilities.admin);
};

export const useEntitiesStore_capabilities_readable = () => {
    return useEntitiesStore(
        useShallow((state) => ({
            ...state.capabilities.admin,
            ...state.capabilities.write,
            ...state.capabilities.read,
        }))
    );
};

export const useEntitiesStore_capabilities_hasDemoTenantAccess = () => {
    return useEntitiesStore(
        useShallow((state) => {
            return Object.keys({
                ...state.capabilities.admin,
                ...state.capabilities.write,
                ...state.capabilities.read,
            }).includes('demo/');
        })
    );
};

export const useEntitiesStore_capabilities_writable = () => {
    return useEntitiesStore((state) => {
        return {
            ...state.capabilities.admin,
            ...state.capabilities.write,
        };
    });
};

export const useEntitiesStore_hydrateState = () => {
    return useEntitiesStore((state) => state.hydrateState);
};
export const useEntitiesStore_hydrated = () => {
    return useEntitiesStore((state) => state.hydrated);
};
export const useEntitiesStore_setHydrated = () => {
    return useEntitiesStore((state) => state.setHydrated);
};
export const useEntitiesStore_setActive = () => {
    return useEntitiesStore((state) => state.setActive);
};
export const useEntitiesStore_hydrationErrors = () => {
    return useEntitiesStore((state) => state.hydrationErrors);
};
export const useEntitiesStore_setHydrationErrors = () => {
    return useEntitiesStore((state) => state.setHydrationErrors);
};
export const useEntitiesStore_mutate = () => {
    return useEntitiesStore((state) => state.mutate);
};
const useEntitiesStore_setMutate = () => {
    return useEntitiesStore((state) => state.setMutate);
};

export const useSidePanelDocsStore_resetState = () => {
    return useEntitiesStore((state) => state.resetState);
};

// We hardcode the key here as we only call once
export const useHydrateState = () => {
    const hydrateState = useEntitiesStore_hydrateState();
    const setActive = useEntitiesStore_setActive();

    const response = useSWR(
        'entities_hydrator',
        () => {
            setActive(true);
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
            setHydrationErrors(response.data?.error);
            setCapabilities(response.data?.data ?? null);
            setMutate(response.mutate);
            setHydrated(true);
        }
    }, [
        response.data?.data,
        response.data?.error,
        response.isValidating,
        response.mutate,
        setCapabilities,
        setHydrated,
        setHydrationErrors,
        setMutate,
    ]);

    return response;
};
