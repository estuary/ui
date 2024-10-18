import { isEqual } from 'lodash';
import { useShallow } from 'zustand/react/shallow';
import { useEndpointConfigStore } from './Store';

export const useEndpointConfigStore_errorsExist = () => {
    return useEndpointConfigStore((state) => state.errorsExist);
};

export const useEndpointConfigStore_endpointConfigErrors = () => {
    return useEndpointConfigStore((state) => state.endpointConfigErrors);
};

export const useEndpointConfigStore_reset = () => {
    return useEndpointConfigStore((state) => state.resetState);
};

export const useEndpointConfigStore_changed = () => {
    return useEndpointConfigStore(
        useShallow(
            (state) =>
                !isEqual(
                    state.encryptedEndpointConfig,
                    state.publishedEndpointConfig
                )
        )
    );
};

export const useEndpointConfigStore_endpointSchema = () => {
    return useEndpointConfigStore((state) => state.endpointSchema);
};

export const useEndpointConfigStore_customErrors = () => {
    return useEndpointConfigStore((state) => state.customErrors);
};

export const useEndpointConfigStore_setCustomErrors = () => {
    return useEndpointConfigStore((state) => state.setCustomErrors);
};

export const useEndpointConfigStore_setEndpointSchema = () => {
    return useEndpointConfigStore((state) => state.setEndpointSchema);
};

export const useEndpointConfigStore_encryptedEndpointConfig_data = () => {
    return useEndpointConfigStore(
        (state) => state.encryptedEndpointConfig.data
    );
};

export const useEndpointConfigStore_setEncryptedEndpointConfig = () => {
    return useEndpointConfigStore((state) => state.setEncryptedEndpointConfig);
};

export const useEndpointConfigStore_previousEndpointConfig_data = () => {
    return useEndpointConfigStore((state) => state.previousEndpointConfig.data);
};

export const useEndpointConfigStore_setPreviousEndpointConfig = () => {
    return useEndpointConfigStore((state) => state.setPreviousEndpointConfig);
};

export const useEndpointConfigStore_endpointConfig_data = () => {
    return useEndpointConfigStore((state) => state.endpointConfig.data);
};

export const useEndpointConfigStore_setEndpointConfig = () => {
    return useEndpointConfigStore((state) => state.setEndpointConfig);
};

export const useEndpointConfig_hydrated = () => {
    return useEndpointConfigStore((state) => state.hydrated);
};

export const useEndpointConfig_setHydrated = () => {
    return useEndpointConfigStore((state) => state.setHydrated);
};

export const useEndpointConfig_hydrationErrorsExist = () => {
    return useEndpointConfigStore((state) => state.hydrationErrorsExist);
};

export const useEndpointConfig_setHydrationErrorsExist = () => {
    return useEndpointConfigStore((state) => state.setHydrationErrorsExist);
};

export const useEndpointConfig_hydrateState = () => {
    return useEndpointConfigStore((state) => state.hydrateState);
};

export const useEndpointConfig_setActive = () => {
    return useEndpointConfigStore((state) => state.setActive);
};

export const useEndpointConfig_serverUpdateRequired = () => {
    return useEndpointConfigStore((state) => state.serverUpdateRequired);
};

export const useEndpointConfig_setServerUpdateRequired = () => {
    return useEndpointConfigStore((state) => state.setServerUpdateRequired);
};

export const useEndpointConfig_endpointCanBeEmpty = () => {
    return useEndpointConfigStore((state) => state.endpointCanBeEmpty);
};

export const useEndpointConfig_setEndpointCanBeEmpty = () => {
    return useEndpointConfigStore((state) => state.setEndpointCanBeEmpty);
};
