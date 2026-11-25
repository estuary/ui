import { useShallow } from 'zustand/react/shallow';

import { isEqual } from 'lodash';

import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';

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

export const useEndpointConfigStore_encryptedEndpointConfig_data = () => {
    return useEndpointConfigStore(
        (state) => state.encryptedEndpointConfig.data
    );
};

export const useEndpointConfigStore_savedEndpointConfig_data = () => {
    return useEndpointConfigStore((state) => state.savedEndpointConfig.data);
};

export const useEndpointConfigStore_setSavedEndpointConfig = () => {
    return useEndpointConfigStore((state) => state.setSavedEndpointConfig);
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

export const useEndpointConfig_hydrationErrorsExist = () => {
    return useEndpointConfigStore((state) => state.hydrationErrorsExist);
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

export const useEndpointConfigStore_savedSecretNames = () => {
    return useEndpointConfigStore((state) => state.savedSecretNames);
};

export const useEndpointConfigStore_clearStoredSecrets = () => {
    return useEndpointConfigStore((state) => state.clearStoredSecrets);
};

export const useEndpointConfigStore_activeSecretNames = () => {
    return useEndpointConfigStore((state) => state.activeSecretNames);
};

export const useEndpointConfigStore_sopsPinned = () => {
    return useEndpointConfigStore((state) => state.sopsPinned);
};
