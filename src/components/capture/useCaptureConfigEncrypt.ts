import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useCallback } from 'react';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import {
    useEndpointConfigStore_endpointSchema,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import { Schema } from 'types';
import { encryptEndpointConfig } from 'utils/sops-utils';

function useDiscoverConfigEncrypt() {
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
        async (selectedEndpointConfig: Schema) => {
            const encryptedEndpointConfig = await encryptEndpointConfig(
                selectedEndpointConfig,
                endpointSchema,
                serverUpdateRequired,
                imageConnectorId,
                imageConnectorTagId,
                callFailed,
                { overrideJsonFormDefaults: true }
            );

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
