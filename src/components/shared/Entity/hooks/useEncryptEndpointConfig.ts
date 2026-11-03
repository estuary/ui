import type { FormError } from 'src/stores/FormState/types';
import type { Schema } from 'src/types';
import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
} from 'src/stores/EndpointConfig/hooks';
import { useSecretsStore_usesSecrets } from 'src/stores/Secrets/hooks';
import { encryptEndpointConfig } from 'src/utils/sops-utils';

/**
 * Callback hook that resolves to the workflow's endpoint config, encrypted.
 * The form's config is encrypted when it changed, otherwise the server's
 * already encrypted config is used. Tasks using secrets get the config as is,
 * since their secret values live in secrets rather than the config.
 */
export function useEncryptEndpointConfig() {
    const imageConnectorId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.connectorId
    );
    const imageConnectorTagId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );

    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const serverEndpointConfigData =
        useEndpointConfigStore_encryptedEndpointConfig_data();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();
    const usesSecrets = useSecretsStore_usesSecrets();

    return useCallback(async (): Promise<Result<Schema, FormError>> => {
        const selectedEndpointConfig = serverUpdateRequired
            ? endpointConfigData
            : serverEndpointConfigData;

        if (usesSecrets) {
            return { value: selectedEndpointConfig };
        }

        const { value, error } = await encryptEndpointConfig(
            selectedEndpointConfig,
            endpointSchema,
            serverUpdateRequired,
            imageConnectorId,
            imageConnectorTagId
        );

        if (error) {
            return { error: { title: 'entityCreate.sops.failedTitle', error } };
        }

        return { value };
    }, [
        endpointConfigData,
        endpointSchema,
        imageConnectorId,
        imageConnectorTagId,
        serverEndpointConfigData,
        serverUpdateRequired,
        usesSecrets,
    ]);
}
