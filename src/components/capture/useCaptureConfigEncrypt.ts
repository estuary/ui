import { useCallback } from 'react';

import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_endpointSchema,
} from 'src/stores/EndpointConfig/hooks';
import { Schema } from 'src/types';
import { encryptEndpointConfig } from 'src/utils/sops-utils';

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
