import { singleCallSettings } from 'context/SWR';
import { useZustandStore } from 'context/Zustand/provider';
import { useEffect } from 'react';
import { GlobalStoreNames } from 'stores/names';
import useSWR from 'swr';
import { Schema } from 'types';
import { ConnectorsState } from './types';

export const useConnectorsStore_connectors = (
    kind: keyof ConnectorsState['connectors']
) => {
    return useZustandStore<ConnectorsState, Schema>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.connectors[kind]
    );
};
export const useConnectorsStore_setConnectors = () => {
    return useZustandStore<ConnectorsState, ConnectorsState['setConnectors']>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.setConnectors
    );
};

export const useConnectorsStore_hydrateState = () => {
    return useZustandStore<ConnectorsState, ConnectorsState['hydrateState']>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.hydrateState
    );
};
export const useConnectorsStore_hydrated = () => {
    return useZustandStore<ConnectorsState, ConnectorsState['hydrated']>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.hydrated
    );
};
export const useConnectorsStore_setHydrated = () => {
    return useZustandStore<ConnectorsState, ConnectorsState['setHydrated']>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.setHydrated
    );
};
export const useConnectorsStore_setActive = () => {
    return useZustandStore<ConnectorsState, ConnectorsState['setActive']>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.setActive
    );
};
export const useConnectorsStore_hydrationErrors = () => {
    return useZustandStore<ConnectorsState, ConnectorsState['hydrationErrors']>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.hydrationErrors
    );
};
export const useConnectorsStore_setHydrationErrors = () => {
    return useZustandStore<
        ConnectorsState,
        ConnectorsState['setHydrationErrors']
    >(GlobalStoreNames.CONNECTORS, (state) => state.setHydrationErrors);
};
export const useConnectorsStore_setMutate = () => {
    return useZustandStore<ConnectorsState, ConnectorsState['setMutate']>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.setMutate
    );
};

export const useSidePanelDocsStore_resetState = () => {
    return useZustandStore<ConnectorsState, ConnectorsState['resetState']>(
        GlobalStoreNames.CONNECTORS,
        (state) => state.resetState
    );
};

// We hardcode the key here as we only call once
export const useHydrateState = () => {
    const hydrateState = useConnectorsStore_hydrateState();
    const setActive = useConnectorsStore_setActive();

    const response = useSWR(
        'connectors_hydrator',
        () => {
            setActive(true);
            return hydrateState();
        },
        singleCallSettings
    );

    // The rest of the stuff we need to handle hydration
    const setHydrationErrors = useConnectorsStore_setHydrationErrors();
    const setConnectors = useConnectorsStore_setConnectors();
    const setHydrated = useConnectorsStore_setHydrated();
    const setMutate = useConnectorsStore_setMutate();

    // Once we are done validating update all the settings
    useEffect(() => {
        if (!response.isValidating) {
            setHydrationErrors(response.data?.error);
            setConnectors(response.data?.data ?? null);
            setMutate(response.mutate);
            setHydrated(true);
        }
    }, [
        response.data?.data,
        response.data?.error,
        response.isValidating,
        response.mutate,
        setConnectors,
        setHydrated,
        setHydrationErrors,
        setMutate,
    ]);

    return response;
};
