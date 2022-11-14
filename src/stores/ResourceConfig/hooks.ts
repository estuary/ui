import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';
import { ResourceConfigStoreNames } from 'stores/names';
import { Entity } from 'types';
import shallow from 'zustand/shallow';
import { ResourceConfigState } from './types';

// Selector Hooks
const getStoreName = (entityType: Entity): ResourceConfigStoreNames => {
    if (entityType === 'capture' || entityType === 'materialization') {
        return ResourceConfigStoreNames.GENERAL;
    } else {
        throw new Error('Invalid ResourceConfig store name');
    }
};

export const useResourceConfig_collections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collections']
    >(getStoreName(entityType), (state) => state.collections);
};

export const useResourceConfig_preFillEmptyCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillEmptyCollections']
    >(getStoreName(entityType), (state) => state.preFillEmptyCollections);
};

export const useResourceConfig_preFillCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillCollections']
    >(getStoreName(entityType), (state) => state.preFillCollections);
};

export const useResourceConfig_addCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['addCollections']
    >(getStoreName(entityType), (state) => state.addCollections);
};

export const useResourceConfig_removeCollection = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['removeCollection']
    >(getStoreName(entityType), (state) => state.removeCollection);
};

export const useResourceConfig_removeAllCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['removeAllCollections']
    >(getStoreName(entityType), (state) => state.removeAllCollections);
};

export const useResourceConfig_collectionErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collectionErrorsExist']
    >(getStoreName(entityType), (state) => state.collectionErrorsExist);
};

export const useResourceConfig_currentCollection = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['currentCollection']
    >(getStoreName(entityType), (state) => state.currentCollection);
};

export const useResourceConfig_setCurrentCollection = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setCurrentCollection']
    >(getStoreName(entityType), (state) => state.setCurrentCollection);
};

export const useResourceConfig_discoveredCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['discoveredCollections']
    >(getStoreName(entityType), (state) => state.discoveredCollections);
};

export const useResourceConfig_setDiscoveredCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setDiscoveredCollections']
    >(getStoreName(entityType), (state) => state.setDiscoveredCollections);
};

export const useResourceConfig_restrictedDiscoveredCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['restrictedDiscoveredCollections']
    >(
        getStoreName(entityType),
        (state) => state.restrictedDiscoveredCollections
    );
};

export const useResourceConfig_setRestrictedDiscoveredCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setRestrictedDiscoveredCollections']
    >(
        getStoreName(entityType),
        (state) => state.setRestrictedDiscoveredCollections
    );
};

export const useResourceConfig_resourceConfig = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(getStoreName(entityType), (state) => state.resourceConfig, shallow);
};

export const useResourceConfig_setResourceConfig = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(getStoreName(entityType), (state) => state.setResourceConfig);
};

export const useResourceConfig_resetResourceConfigAndCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetResourceConfigAndCollections']
    >(
        getStoreName(entityType),
        (state) => state.resetResourceConfigAndCollections
    );
};

export const useResourceConfig_resourceConfigErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(getStoreName(entityType), (state) => state.resourceConfigErrorsExist);
};

export const useResourceConfig_resourceConfigErrors = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrors']
    >(getStoreName(entityType), (state) => state.resourceConfigErrors);
};

export const useResourceConfig_resourceSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceSchema']
    >(getStoreName(entityType), (state) => state.resourceSchema);
};

export const useResourceConfig_setResourceSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(getStoreName(entityType), (state) => state.setResourceSchema);
};

export const useResourceConfig_stateChanged = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['stateChanged']
    >(getStoreName(entityType), (state) => state.stateChanged);
};

export const useResourceConfig_resetState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(getStoreName(entityType), (state) => state.resetState);
};

export const useResourceConfig_hydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrated']
    >(getStoreName(entityType), (state) => state.hydrated);
};

export const useResourceConfig_setHydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setHydrated']
    >(getStoreName(entityType), (state) => state.setHydrated);
};

export const useResourceConfig_hydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.hydrationErrorsExist);
};

export const useResourceConfig_setHydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setHydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.setHydrationErrorsExist);
};

export const useResourceConfig_hydrateState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['hydrateState']
    >(getStoreName(entityType), (state) => state.hydrateState);
};

export const useResourceConfig_serverUpdateRequired = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['serverUpdateRequired']
    >(getStoreName(entityType), (state) => state.serverUpdateRequired);
};

export const useResourceConfig_setServerUpdateRequired = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setServerUpdateRequired']
    >(getStoreName(entityType), (state) => state.setServerUpdateRequired);
};
