import { useZustandStore } from 'context/Zustand/provider';
import { ResourceConfigStoreNames } from 'stores/names';
import { shallow } from 'zustand/shallow';
import { ResourceConfigState } from './types';

// Selector Hooks
export const useResourceConfig_removeCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['removeCollections']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.removeCollections);
};

export const useResourceConfig_resetConfigAndCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetConfigAndCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.resetConfigAndCollections
    );
};

export const useResourceConfig_collectionErrorsExist = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collectionErrorsExist']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.collectionErrorsExist);
};

export const useResourceConfig_discoveredCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['discoveredCollections']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.discoveredCollections);
};

export const useResourceConfig_setDiscoveredCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setDiscoveredCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.setDiscoveredCollections
    );
};

export const useResourceConfig_restrictedDiscoveredCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['restrictedDiscoveredCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.restrictedDiscoveredCollections
    );
};

export const useResourceConfig_setRestrictedDiscoveredCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setRestrictedDiscoveredCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.setRestrictedDiscoveredCollections
    );
};

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

export const useResourceConfig_resourceConfig = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.resourceConfig,
        shallow
    );
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

export const useResourceConfig_resourceConfigOfCollection = (
    collection: keyof ResourceConfigState['resourceConfig']
) => {
    return useZustandStore<ResourceConfigState, any>(
        ResourceConfigStoreNames.GENERAL,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (state) => state.resourceConfig[collection],
        shallow
    );
};

export const useResourceConfig_toggleDisable = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['toggleDisable']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.toggleDisable);
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

export const useResourceConfig_resourceConfigErrorsExist = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.resourceConfigErrorsExist
    );
};

export const useResourceConfig_resourceConfigErrors = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrors']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.resourceConfigErrors);
};

export const useResourceConfig_stateChanged = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['stateChanged']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.stateChanged);
};

export const useResourceConfig_resetState = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.resetState);
};

export const useResourceConfig_hydrated = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrated']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.hydrated);
};

export const useResourceConfig_setHydrated = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setHydrated']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.setHydrated);
};

export const useResourceConfig_setActive = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setActive']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.setActive);
};

export const useResourceConfig_hydrationErrorsExist = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrationErrorsExist']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.hydrationErrorsExist);
};

export const useResourceConfig_setHydrationErrorsExist = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setHydrationErrorsExist']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.setHydrationErrorsExist
    );
};

export const useResourceConfig_hydrateState = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrateState']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.hydrateState);
};

export const useResourceConfig_serverUpdateRequired = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['serverUpdateRequired']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.serverUpdateRequired);
};

export const useResourceConfig_setServerUpdateRequired = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setServerUpdateRequired']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.setServerUpdateRequired
    );
};

export const useResourceConfig_rediscoveryRequired = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['rediscoveryRequired']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.rediscoveryRequired);
};

export const useResourceConfig_resetRediscoverySettings = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetRediscoverySettings']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.resetRediscoverySettings
    );
};

export const useResourceConfig_evaluateDiscoveredCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['evaluateDiscoveredCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.evaluateDiscoveredCollections
    );
};
