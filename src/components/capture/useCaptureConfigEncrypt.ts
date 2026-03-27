import type { Schema } from 'src/types';

import { useCallback } from 'react';

import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useConnectorTag } from 'src/context/ConnectorTag';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_endpointSchema,
} from 'src/stores/EndpointConfig/hooks';
import { encryptEndpointConfig } from 'src/utils/sops-utils';

function useDiscoverConfigEncrypt() {
    const { callFailed } = useEntityWorkflowHelpers();
    const connectorTag = useConnectorTag();

    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

    return useCallback(
        async (selectedEndpointConfig: Schema) => {
            const encryptedEndpointConfig = await encryptEndpointConfig(
                selectedEndpointConfig,
                endpointSchema,
                serverUpdateRequired,
                connectorTag.connector.id,
                connectorTag.id,
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
            connectorTag.connector.id,
            connectorTag.id,
            endpointSchema,
            serverUpdateRequired,
        ]
    );
}

export default useDiscoverConfigEncrypt;
