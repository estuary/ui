import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';
import { EndpointConfigStoreNames } from 'stores/names';
import { Entity } from 'types';
import { EndpointConfigState } from './types';

const getStoreName = (entityType: Entity): EndpointConfigStoreNames => {
    if (entityType === 'capture' || entityType === 'materialization') {
        return EndpointConfigStoreNames.GENERAL;
    } else {
        throw new Error('Invalid EndpointConfig store name');
    }
};

export const useEndpointConfigStore_errorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(getStoreName(entityType), (state) => state.endpointConfigErrorsExist);
};

export const useEndpointConfigStore_endpointConfigErrors = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrors']
    >(getStoreName(entityType), (state) => state.endpointConfigErrors);
};

export const useEndpointConfigStore_reset = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['resetState']
    >(getStoreName(entityType), (state) => state.resetState);
};

export const useEndpointConfigStore_changed = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['stateChanged']
    >(getStoreName(entityType), (state) => state.stateChanged);
};

export const useEndpointConfigStore_endpointSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointSchema']
    >(getStoreName(entityType), (state) => state.endpointSchema);
};

export const useEndpointConfigStore_endpointCustomErrors = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointCustomErrors']
    >(getStoreName(entityType), (state) => state.endpointCustomErrors);
};

export const useEndpointConfigStore_setEndpointCustomErrors = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointCustomErrors']
    >(getStoreName(entityType), (state) => state.setEndpointCustomErrors);
};

export const useEndpointConfigStore_setEndpointSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointSchema']
    >(getStoreName(entityType), (state) => state.setEndpointSchema);
};

export const useEndpointConfigStore_encryptedEndpointConfig_data = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['encryptedEndpointConfig']['data']
    >(getStoreName(entityType), (state) => state.encryptedEndpointConfig.data);
};

export const useEndpointConfigStore_setEncryptedEndpointConfig = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setEncryptedEndpointConfig']
    >(getStoreName(entityType), (state) => state.setEncryptedEndpointConfig);
};

export const useEndpointConfigStore_previousEndpointConfig_data = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['previousEndpointConfig']['data']
    >(getStoreName(entityType), (state) => state.previousEndpointConfig.data);
};

export const useEndpointConfigStore_setPreviousEndpointConfig = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setPreviousEndpointConfig']
    >(getStoreName(entityType), (state) => state.setPreviousEndpointConfig);
};

export const useEndpointConfigStore_endpointConfig_data = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfig']['data']
    >(getStoreName(entityType), (state) => state.endpointConfig.data);
};

export const useEndpointConfigStore_setEndpointConfig = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointConfig']
    >(getStoreName(entityType), (state) => state.setEndpointConfig);
};

export const useEndpointConfig_hydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['hydrated']
    >(getStoreName(entityType), (state) => state.hydrated);
};

export const useEndpointConfig_setHydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setHydrated']
    >(getStoreName(entityType), (state) => state.setHydrated);
};

export const useEndpointConfig_hydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['hydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.hydrationErrorsExist);
};

export const useEndpointConfig_setHydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setHydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.setHydrationErrorsExist);
};

export const useEndpointConfig_hydrateState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['hydrateState']
    >(getStoreName(entityType), (state) => state.hydrateState);
};

export const useEndpointConfig_serverUpdateRequired = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['serverUpdateRequired']
    >(getStoreName(entityType), (state) => state.serverUpdateRequired);
};

export const useEndpointConfig_setServerUpdateRequired = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setServerUpdateRequired']
    >(getStoreName(entityType), (state) => state.setServerUpdateRequired);
};

export const useEndpointConfig_endpointCanBeEmpty = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointCanBeEmpty']
    >(getStoreName(entityType), (state) => state.endpointCanBeEmpty);
};

export const useEndpointConfig_setEndpointCanBeEmpty = () => {
    const entityType = useEntityType();

    return useZustandStore<
        EndpointConfigState,
        EndpointConfigState['setEndpointCanBeEmpty']
    >(getStoreName(entityType), (state) => state.setEndpointCanBeEmpty);
};
