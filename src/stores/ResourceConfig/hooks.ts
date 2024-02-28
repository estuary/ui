import { useZustandStore } from 'context/Zustand/provider';
import { ResourceConfigStoreNames } from 'stores/names';
import { shallow } from 'zustand/shallow';
import { ResourceConfigState } from './types';

// Selector Hooks
export const useResourceConfig_backfilledCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['backfilledCollections']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.backfilledCollections);
};

export const useResourceConfig_addBackfilledCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['addBackfilledCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.addBackfilledCollections
    );
};

export const useResourceConfig_setBackfilledCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setBackfilledCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.setBackfilledCollections
    );
};

export const useResourceConfig_backfillAllBindings = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['backfillAllBindings']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.backfillAllBindings);
};

export const useResourceConfig_allBindingsDisabled = () => {
    return useZustandStore<ResourceConfigState, boolean>(
        ResourceConfigStoreNames.GENERAL,
        (state) =>
            Object.values(state.resourceConfig).every(
                (config) => config.disable
            ),
        shallow
    );
};

export const useResourceConfig_resetResourceConfigAndCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetResourceConfigAndCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.resetResourceConfigAndCollections
    );
};

export const useResourceConfig_resetState = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.resetState);
};
