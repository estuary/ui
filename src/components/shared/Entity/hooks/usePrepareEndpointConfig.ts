import type { Schema } from 'src/types';

import { useCallback } from 'react';

import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_endpointSchema,
} from 'src/stores/EndpointConfig/hooks';
import { useSecretsStore_usesSecrets } from 'src/stores/Secrets/hooks';
import { encryptEndpointConfig } from 'src/utils/sops-utils';

interface Response {
    data: Schema;
}

/**
 * Returns a function that prepares an endpoint config to be written to the
 * task spec. Tasks using secrets get the config as is; others get it
 * sops-encrypted.
 *
 * The function resolves to `false` when encryption fails, after the failure
 * has been reported.
 */
export function usePrepareEndpointConfig() {
    const usesSecrets = useSecretsStore_usesSecrets();
    const getSopsConfig = useGetSopsCaptureConfig();

    return useCallback(
        async (endpointConfig: Schema): Promise<Response | false> => {
            if (usesSecrets) {
                return { data: endpointConfig };
            }

            return await getSopsConfig(endpointConfig);
        },
        [getSopsConfig, usesSecrets]
    );
}

function useGetSopsCaptureConfig() {
    const { callFailed } = useEntityWorkflowHelpers();

    const imageConnectorId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.connectorId
    );
    const imageConnectorTagId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );

    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

    return useCallback(
        async (endpointConfig: Schema): Promise<Response | false> => {
            const result = await encryptEndpointConfig(
                endpointConfig,
                endpointSchema,
                serverUpdateRequired,
                imageConnectorId,
                imageConnectorTagId,
                callFailed,
                { overrideJsonFormDefaults: true }
            );

            if (!result || result.error) {
                return false;
            }

            return { data: result.data };
        },
        [
            callFailed,
            endpointSchema,
            imageConnectorId,
            imageConnectorTagId,
            serverUpdateRequired,
        ]
    );
}
