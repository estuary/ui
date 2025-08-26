import { useCallback } from 'react';

import { getSingleConnectorWithTag } from 'src/api/connectors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormHydrator } from 'src/stores/DetailsForm/useDetailsFormHydrator';
import { useEndpointConfigHydrator } from 'src/stores/EndpointConfig/useEndpointConfigHydrator';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { hasLength } from 'src/utils/misc-utils';

export const useWorkflowHydrator = (expressWorkflow: boolean | undefined) => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const { hydrateDetailsForm } = useDetailsFormHydrator();
    const { hydrateEndpointConfig } = useEndpointConfigHydrator();

    const baseCatalogPrefix = useEntitiesStore((state) => {
        const storageMappingPrefixes = Object.keys(state.storageMappings);

        return storageMappingPrefixes.length === 1
            ? storageMappingPrefixes[0]
            : undefined;
    });

    const catalogName = useWorkflowStore((state) => state.catalogName.whole);
    const setConnectorMetadata = useWorkflowStore(
        (state) => state.setConnectorMetadata
    );
    const setHydrated = useWorkflowStore((state) => state.setHydrated);
    const setHydrationError = useWorkflowStore(
        (state) => state.setHydrationError
    );
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );

    const hydrateWorkflow = useCallback(async () => {
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

        const baseEntityName = expressWorkflow
            ? catalogName
            : baseCatalogPrefix;

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
    }, [
        baseCatalogPrefix,
        catalogName,
        connectorId,
        expressWorkflow,
        hydrateDetailsForm,
        hydrateEndpointConfig,
        setConnectorMetadata,
    ]);

    return {
        hydrateState: () =>
            hydrateWorkflow().then(
                () => {
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
