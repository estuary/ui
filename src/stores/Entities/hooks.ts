import { singleCallSettings } from 'context/SWR';
import { useEffect } from 'react';
import useSWR from 'swr';
import { ESTUARY_SUPPORT_ROLE } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';
import { useEntitiesStore } from './Store';

// TODO (Entities Store)
// We should move away from hardcoded hooks and just pass in the capability
//  we are looking for. So a single hook takes in `read`, `write`, `admin` (maybe even an array of these?)
//  and returns the needed entities.
//  I think there is a chance we could use some kind of permissions library to help with this.

export const useEntitiesStore_capabilities_readable = () => {
    return useEntitiesStore((state) => ({
        ...state.capabilities.admin,
        ...state.capabilities.write,
        ...state.capabilities.read,
    }));
};

export const useEntitiesStore_capabilities_writable = () => {
    return useEntitiesStore((state) => {
        return {
            ...state.capabilities.admin,
            ...state.capabilities.write,
        };
    });
};

export const useEntitiesStore_capabilities_adminable = () => {
    return useEntitiesStore((state) => state.capabilities.admin);
};

export const useEntitiesStore_hasSupportRole = () => {
    return useEntitiesStore(
        useShallow((state) =>
            Boolean(state.capabilities.admin[ESTUARY_SUPPORT_ROLE])
        )
    );
};

export const useEntitiesStore_hasDemoTenantAccess = () => {
    const readable = useEntitiesStore_capabilities_readable();
    return useEntitiesStore(
        useShallow(() => {
            return Object.keys(readable).includes('demo/');
        })
    );
};

export const useHydrateState = () => {
    const [
        hydrateState,
        setActive,
        setCapabilities,
        setHydrated,
        setHydrationErrors,
        setMutate,
    ] = useEntitiesStore((state) => [
        state.hydrateState,
        state.setActive,
        state.setCapabilities,
        state.setHydrated,
        state.setHydrationErrors,
        state.setMutate,
    ]);

    // We hardcode the key here as we only call once
    const response = useSWR(
        'entities_hydrator',
        () => {
            setActive(true);
            return hydrateState();
        },
        singleCallSettings
    );

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
