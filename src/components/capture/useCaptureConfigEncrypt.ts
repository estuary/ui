import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useCallback } from 'react';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_connectorImage_id,
} from 'stores/DetailsForm/hooks';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_endpointSchema,
} from 'stores/EndpointConfig/hooks';
import { Schema } from 'types';
import { encryptEndpointConfig } from 'utils/sops-utils';

function useDiscoverConfigEncrypt() {
    const { callFailed } = useEntityWorkflowHelpers();

    const imageConnectorId = useDetailsForm_connectorImage_connectorId();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();

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
