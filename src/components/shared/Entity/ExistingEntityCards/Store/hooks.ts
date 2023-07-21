import { Entity } from 'types';

import { ExistingEntityState } from 'components/shared/Entity/ExistingEntityCards/Store/types';

import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';

import { ExistingEntityStoreNames } from 'stores/names';

const getStoreName = (entityType: Entity): ExistingEntityStoreNames => {
    if (entityType === 'capture' || entityType === 'materialization') {
        return ExistingEntityStoreNames.GENERAL;
    } else {
        throw new Error('Invalid ExistingEntity store name');
    }
};

export const useExistingEntity_hydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['hydrated']
    >(getStoreName(entityType), (state) => state.hydrated);
};

export const useExistingEntity_setHydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['setHydrated']
    >(getStoreName(entityType), (state) => state.setHydrated);
};

export const useExistingEntity_setHydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['setHydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.setHydrationErrorsExist);
};

export const useExistingEntity_hydrateState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['hydrateState']
    >(getStoreName(entityType), (state) => state.hydrateState);
};

export const useExistingEntity_createNewTask = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['createNewTask']
    >(getStoreName(entityType), (state) => state.createNewTask);
};

export const useExistingEntity_connectorName = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['connectorName']
    >(getStoreName(entityType), (state) => state.connectorName);
};

export const useExistingEntity_setCreateNewTask = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['setCreateNewTask']
    >(getStoreName(entityType), (state) => state.setCreateNewTask);
};

export const useExistingEntity_queryData = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['queryData']
    >(getStoreName(entityType), (state) => state.queryData);
};

export const useExistingEntity_setQueryData = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['setQueryData']
    >(getStoreName(entityType), (state) => state.setQueryData);
};

export const useExistingEntity_resetState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        ExistingEntityState,
        ExistingEntityState['resetState']
    >(getStoreName(entityType), (state) => state.resetState);
};
