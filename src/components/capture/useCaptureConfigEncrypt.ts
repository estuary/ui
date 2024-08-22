import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useCallback } from 'react';
import { BASE_ERROR } from 'services/supabase';
import { useConnectorStore } from 'stores/Connector/Store';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useEndpointConfig_serverUpdateRequired } from 'stores/EndpointConfig/hooks';
import { Schema, SupabaseInvokeResponse } from 'types';
import { encryptEndpointConfig } from 'utils/sops-utils';

function useDiscoverConfigEncrypt() {
    const { callFailed } = useEntityWorkflowHelpers();

    const imageConnectorId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.connectorId
    );
    const imageConnectorTagId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );

    const endpointSchema = useConnectorStore(
        (state) => state.tag?.endpoint_spec_schema
    );

    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

    return useCallback(
        async (selectedEndpointConfig: Schema) => {
            let encryptedEndpointConfig: SupabaseInvokeResponse<any>;
            if (endpointSchema) {
                encryptedEndpointConfig = await encryptEndpointConfig(
                    selectedEndpointConfig,
                    endpointSchema,
                    serverUpdateRequired,
                    imageConnectorId,
                    imageConnectorTagId,
                    callFailed,
                    { overrideJsonFormDefaults: true }
                );
            } else {
                // We should not ever get here without endpointSchema but needed to make
                //  typescript happy and decided to handle this properly just in case
                encryptedEndpointConfig = {
                    data: null,
                    error: {
                        ...BASE_ERROR,
                        message: 'missing schema',
                    },
                };
            }

            if (encryptedEndpointConfig.error) {
                callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: encryptedEndpointConfig.error,
                    },
                });

                return false;
            }

            return encryptedEndpointConfig;
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

export default useDiscoverConfigEncrypt;
