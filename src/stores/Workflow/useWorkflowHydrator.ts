import { useCallback } from 'react';

import { useConnectorTag } from 'src/context/ConnectorTag';
import { logRocketConsole } from 'src/services/shared';
import { useDetailsFormHydrator } from 'src/stores/DetailsForm/useDetailsFormHydrator';
import { useEndpointConfigHydrator } from 'src/stores/EndpointConfig/useEndpointConfigHydrator';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const useWorkflowHydrator = (expressWorkflow: boolean | undefined) => {
    const connectorTag = useConnectorTag();

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
        setConnectorMetadata(connectorTag);

        const baseEntityName = expressWorkflow
            ? catalogName
            : baseCatalogPrefix;

        try {
            await hydrateDetailsForm(baseEntityName);
            await hydrateEndpointConfig();
        } catch (error: unknown) {
            return Promise.reject(error);
        }

        return Promise.resolve();
    }, [
        baseCatalogPrefix,
        catalogName,
        connectorTag,
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
