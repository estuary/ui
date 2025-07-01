import type { DataPlaneOption } from 'src/stores/DetailsForm/types';

import { useCallback } from 'react';

import { getSingleConnectorWithTag } from 'src/api/connectors';
import { getDataPlaneOptions } from 'src/api/dataPlanes';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useDetailsFormHydrator } from 'src/stores/DetailsForm/useDetailsFormHydrator';
import { useEndpointConfigHydrator } from 'src/stores/EndpointConfig/useEndpointConfigHydrator';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import {
    generateDataPlaneOption,
    getDataPlaneInfo,
} from 'src/utils/dataPlane-utils';
import { hasLength } from 'src/utils/misc-utils';

export const useWorkflowHydrator = (expressWorkflow: boolean | undefined) => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const { hydrateDetailsForm } = useDetailsFormHydrator();
    const { hydrateEndpointConfig } = useEndpointConfigHydrator();

    const storageMappings = useEntitiesStore((state) => state.storageMappings);

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

    const [setDataPlaneOptions, setHydrationError_details] =
        useDetailsFormStore((state) => {
            return [state.setDataPlaneOptions, state.setHydrationError];
        });

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

            const { dataPlaneNames } = getDataPlaneInfo(
                storageMappings,
                baseEntityName
            );
            const defaultDataPlaneName = dataPlaneNames.at(0);

            // GO fetch all the data plane options the user can see
            const dataPlaneResponse = await getDataPlaneOptions();

            let dataPlaneOptions: DataPlaneOption[] = [];
            if (
                !dataPlaneResponse.error &&
                dataPlaneResponse.data &&
                dataPlaneResponse.data.length > 0
            ) {
                // If we got a response then go ahead and map those options
                dataPlaneOptions = dataPlaneResponse.data.map((dataPlane) =>
                    generateDataPlaneOption(dataPlane, defaultDataPlaneName)
                );
            } else {
                setHydrationError_details(
                    dataPlaneResponse.error?.message ??
                        'An error was encountered initializing the details form. If the issue persists, please contact support.'
                );
                return Promise.reject(dataPlaneResponse.error);
            }

            // Now step through all the storage mappings so we can hack in data planes the user might be missing
            Object.values(storageMappings).forEach((storageMapping) => {
                storageMapping.data_planes.forEach((dataPlaneName) => {
                    if (
                        dataPlaneOptions.findIndex(
                            (datum) =>
                                datum.dataPlaneName.whole === dataPlaneName
                        ) === -1
                    ) {
                        // We are missing a data plane so generate a fake one
                        dataPlaneOptions.push(
                            generateDataPlaneOption(
                                {
                                    data_plane_name: dataPlaneName,
                                    id: dataPlaneName,
                                    reactor_address: '',
                                    cidr_blocks: null,
                                    gcp_service_account_email: null,
                                    aws_iam_user_arn: null,
                                },
                                dataPlaneName
                            )
                        );
                    }
                });
            });

            setDataPlaneOptions(dataPlaneOptions);
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
        setDataPlaneOptions,
        setHydrationError_details,
        storageMappings,
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
