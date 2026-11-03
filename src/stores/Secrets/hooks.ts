import { useMemo } from 'react';

import { isEmpty } from 'lodash';

import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import { useSecretsStore } from 'src/stores/Secrets/store';
import { isDekafConnector } from 'src/utils/connector-utils';
import {
    canUseSecrets,
    getMissingSecretFields,
    getSecretFields,
    isLegacySecretsConfig,
} from 'src/utils/secrets-utils';

export const useSecretsStore_secretNames = () => {
    return useSecretsStore((state) => state.secretNames);
};

export const useSecretsStore_secretName = (pointer: string) => {
    return useSecretsStore((state) => state.secretNames[pointer]);
};

export const useSecretsStore_setSecretName = () => {
    return useSecretsStore((state) => state.setSecretName);
};

export const useSecretsStore_secretValues = () => {
    return useSecretsStore((state) => state.secretValues);
};

export const useSecretsStore_hasSecretValue = (pointer: string) => {
    return useSecretsStore((state) =>
        Object.hasOwn(state.secretValues, pointer)
    );
};

export const useSecretsStore_setSecretValue = () => {
    return useSecretsStore((state) => state.setSecretValue);
};

export const useSecretsStore_serverUpdateRequired = () => {
    return useSecretsStore((state) => state.serverUpdateRequired);
};

export const useSecretsStore_setSecretsSaved = () => {
    return useSecretsStore((state) => state.setSecretsSaved);
};

export const useSecretsStore_hydrate = () => {
    return useSecretsStore((state) => state.hydrate);
};

export const useSecretsStore_resetState = () => {
    return useSecretsStore((state) => state.resetState);
};

// Secret fields are stored as secrets unless the task already uses sops (or
// plaintext secret values), the connector can't support them, or it's Dekaf
export const useSecretsStore_usesSecrets = () => {
    const endpointSchema = useEndpointConfigStore(
        (state) => state.endpointSchema
    );
    const publishedEndpointConfig = useEndpointConfigStore(
        (state) => state.publishedEndpointConfig.data
    );
    const isDekaf = useDetailsFormStore((state) =>
        isDekafConnector(state.details.data.connectorImage)
    );

    return useMemo(
        () =>
            !isDekaf &&
            !isEmpty(endpointSchema) &&
            canUseSecrets(endpointSchema) &&
            !isLegacySecretsConfig(endpointSchema, publishedEndpointConfig),
        [endpointSchema, isDekaf, publishedEndpointConfig]
    );
};

// Secret fields are relaxed out of the form schema's `required`, so whether one
// is required comes from the original schema
export const useSecretsStore_secretRequired = (pointer: string) => {
    const endpointSchema = useEndpointConfigStore(
        (state) => state.endpointSchema
    );
    const endpointConfig = useEndpointConfigStore(
        (state) => state.endpointConfig.data
    );

    return useMemo(
        () =>
            getSecretFields(endpointSchema, endpointConfig).some(
                (field) => field.pointer === pointer && field.required
            ),
        [endpointConfig, endpointSchema, pointer]
    );
};

// Legacy (sops) configs keep their secret values in the config, where the form
// validates them as usual
const useMissingSecretFields = () => {
    const usesSecrets = useSecretsStore_usesSecrets();
    const endpointSchema = useEndpointConfigStore(
        (state) => state.endpointSchema
    );
    const endpointConfig = useEndpointConfigStore(
        (state) => state.endpointConfig.data
    );
    const secretNames = useSecretsStore_secretNames();
    const secretValues = useSecretsStore_secretValues();

    return useMemo(
        () =>
            usesSecrets
                ? getMissingSecretFields(
                      endpointSchema,
                      endpointConfig,
                      secretNames,
                      secretValues
                  )
                : [],
        [endpointConfig, endpointSchema, secretNames, secretValues, usesSecrets]
    );
};

export const useSecretsStore_secretMissing = (pointer: string) => {
    const missing = useMissingSecretFields();

    return missing.some((field) => field.pointer === pointer);
};

// Missing required secrets, for the error summary. Like the endpoint config's
// own errors, they only count while something needs sending to the server.
export const useSecretsStore_errors = () => {
    const missing = useMissingSecretFields();
    const endpointConfigServerUpdateRequired = useEndpointConfigStore(
        (state) => state.serverUpdateRequired
    );
    const secretsServerUpdateRequired = useSecretsStore_serverUpdateRequired();

    return useMemo(
        () =>
            endpointConfigServerUpdateRequired || secretsServerUpdateRequired
                ? missing.map(({ path }) => ({
                      message: `${path.join('.')} requires a secret`,
                  }))
                : [],
        [
            endpointConfigServerUpdateRequired,
            missing,
            secretsServerUpdateRequired,
        ]
    );
};

export const useSecretsStore_errorsExist = () => {
    return useSecretsStore_errors().length > 0;
};
