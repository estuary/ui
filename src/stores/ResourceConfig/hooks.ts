import { useZustandStore } from 'context/Zustand/provider';
import { ResourceConfigStoreNames } from 'stores/names';
import { shallow } from 'zustand/shallow';
import { ResourceConfigState } from './types';

// Selector Hooks
export const useResourceConfig_collections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collections']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.collections);
};

export const useResourceConfig_preFillEmptyCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillEmptyCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.preFillEmptyCollections
    );
};

export const useResourceConfig_addCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['addCollections']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.addCollections);
};

export const useResourceConfig_removeCollection = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['removeCollection']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.removeCollection);
};

export const useResourceConfig_removeAllCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['removeAllCollections']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.removeAllCollections);
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

export const useResourceConfig_currentCollection = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['currentCollection']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.currentCollection);
};

export const useResourceConfig_setCurrentCollection = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setCurrentCollection']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.setCurrentCollection);
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

export const useResourceConfig_resourceConfigOfCollectionProperty = (
    collection: keyof ResourceConfigState['resourceConfig'],
    property: any
) => {
    return useZustandStore<ResourceConfigState, any>(
        ResourceConfigStoreNames.GENERAL,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (state) => state.resourceConfig[collection]?.[property],
        shallow
    );
};

export const useResourceConfig_setResourceConfig = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.setResourceConfig);
};

export const useResourceConfig_updateResourceConfig = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['updateResourceConfig']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.updateResourceConfig);
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

export const useResourceConfig_resourceSchema = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceSchema']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.resourceSchema);
};

export const useResourceConfig_setResourceSchema = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(ResourceConfigStoreNames.GENERAL, (state) => state.setResourceSchema);
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

export const useResourceConfig_evaluateDiscoveredCollections = () => {
    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['evaluateDiscoveredCollections']
    >(
        ResourceConfigStoreNames.GENERAL,
        (state) => state.evaluateDiscoveredCollections
    );
};
