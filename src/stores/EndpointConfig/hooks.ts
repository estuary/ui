import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { isEqual } from 'lodash';

import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import {
    useSecretsStore_errors,
    useSecretsStore_errorsExist,
} from 'src/stores/Secrets/hooks';

// Missing required secrets count as endpoint config errors
export const useEndpointConfigStore_errorsExist = () => {
    const errorsExist = useEndpointConfigStore((state) => state.errorsExist);
    const secretsErrorsExist = useSecretsStore_errorsExist();

    return errorsExist || secretsErrorsExist;
};

export const useEndpointConfigStore_endpointConfigErrors = () => {
    const errors = useEndpointConfigStore(
        (state) => state.endpointConfigErrors
    );
    const secretsErrors = useSecretsStore_errors();

    return useMemo(
        () => [...errors, ...secretsErrors],
        [errors, secretsErrors]
    );
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
