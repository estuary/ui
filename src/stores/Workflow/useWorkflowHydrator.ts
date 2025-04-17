import { useCallback } from 'react';

import { getSingleConnectorWithTag } from 'src/api/connectors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormHydrator } from 'src/stores/DetailsForm/useDetailsFormHydrator';
import { useEndpointConfigHydrator } from 'src/stores/EndpointConfig/useEndpointConfigHydrator';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { hasLength } from 'src/utils/misc-utils';

export const useWorkflowHydrator = () => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const { hydrateDetailsForm } = useDetailsFormHydrator();
    const { hydrateEndpointConfig } = useEndpointConfigHydrator();

    const setConnectorMetadata = useWorkflowStore(
        (state) => state.setConnectorMetadata
    );
    const setCustomerId = useWorkflowStore((state) => state.setCustomerId);
    const setHydrated = useWorkflowStore((state) => state.setHydrated);
    const setHydrationError = useWorkflowStore(
        (state) => state.setHydrationError
    );
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );
    const setRedirectUrl = useWorkflowStore((state) => state.setRedirectUrl);

    const hydrateWorkflow = useCallback(
        async (metadata?: { customerId: string; prefix: string }) => {
            const { data: connectorMetadata, error: connectorError } =
                await getSingleConnectorWithTag(connectorId);

            if (
                !hasLength(connectorId) ||
                connectorError ||
                !connectorMetadata ||
                connectorMetadata.length === 0
            ) {
                logRocketEvent(CustomEvents.CONNECTOR_VERSION_MISSING);

                return Promise.reject(
                    connectorError ?? 'Connector information not found'
                );
            }

            setConnectorMetadata(connectorMetadata);

            const baseEntityName = metadata
                ? `${metadata.prefix}${metadata.customerId}`
                : undefined;

            try {
                const { connectorTagId } = await hydrateDetailsForm(
                    connectorId,
                    connectorMetadata[0],
                    baseEntityName
                );

                await hydrateEndpointConfig(
                    connectorTagId,
                    connectorMetadata[0].connector_tags
                );
            } catch (error: unknown) {
                return Promise.reject(error);
            }

            return Promise.resolve();
        },
        [
            connectorId,
            hydrateDetailsForm,
            hydrateEndpointConfig,
            setConnectorMetadata,
        ]
    );

    return {
        hydrateState: (metadata?: {
            customerId: string;
            prefix: string;
            redirectURL: string;
        }) =>
            hydrateWorkflow(metadata).then(
                () => {
                    if (metadata) {
                        const { customerId, redirectURL } = metadata;

                        setCustomerId(customerId);
                        setRedirectUrl(redirectURL);
                    }

                    setHydrated(true);
                },
                (error) => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);
                    setHydrationError(
                        typeof error === 'string'
                            ? error
                            : 'Failed to hydrate workflow'
                    );

                    logRocketConsole('Failed to hydrate workflow', error);
                }
            ),
    };
};
