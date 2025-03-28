import { useCallback } from 'react';

import type {
    DraftSpecsExtQuery_ByCatalogName} from 'src/api/draftSpecs';
import {
    getDraftSpecsByCatalogName,
} from 'src/api/draftSpecs';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useEntityNameSuffix from 'src/hooks/useEntityNameSuffix';
import {
    useBinding_bindings,
    useBinding_resourceConfigs,
    useBinding_serverUpdateRequired,
} from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { isDekafConnector } from 'src/utils/connector-utils';
import { modifyExistingCaptureDraftSpec } from 'src/utils/workflow-utils';

function useDiscoverDraftUpdate(options?: {
    initiateRediscovery?: boolean;
    initiateDiscovery?: boolean;
}) {
    const postGenerateMutate = useMutateDraftSpec();
    const isEdit = useEntityWorkflow_Editing();
    const { callFailed } = useEntityWorkflowHelpers();

    const draftId = useEditorStore_id();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const setDraftId = useEditorStore_setId();

    const imagePath = useDetailsFormStore((state) =>
        isDekafConnector(state.details.data.connectorImage)
            ? undefined
            : state.details.data.connectorImage.imagePath
    );

    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    const bindings = useBinding_bindings();
    const resourceConfig = useBinding_resourceConfigs();
    const resourceConfigServerUpdateRequired =
        useBinding_serverUpdateRequired();

    const processedEntityName = useEntityNameSuffix(
        !isEdit && options?.initiateDiscovery
    );

    return useCallback(
        async (encryptedEndpointConfigResponse: any) => {
            // Should Update when...
            //      Clicking Next to generate
            //      Clicking Refresh when there are changes that need added to draft
            // Should skip update when...
            //      Doing a discovery
            //      Doing a rediscovery with no new changes

            if (
                imagePath &&
                ((!draftId &&
                    persistedDraftId &&
                    !options?.initiateDiscovery) ||
                    (persistedDraftId &&
                        !options?.initiateDiscovery &&
                        !options?.initiateRediscovery))
            ) {
                const existingDraftSpecResponse =
                    await getDraftSpecsByCatalogName(
                        persistedDraftId,
                        processedEntityName,
                        'capture'
                    );

                if (existingDraftSpecResponse.error) {
                    callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                            error: existingDraftSpecResponse.error,
                        },
                    });

                    return false;
                }

                const existingTaskData: DraftSpecsExtQuery_ByCatalogName | null =
                    existingDraftSpecResponse.data &&
                    existingDraftSpecResponse.data.length > 0
                        ? existingDraftSpecResponse.data[0]
                        : null;

                const draftSpecsResponse = await modifyExistingCaptureDraftSpec(
                    persistedDraftId,
                    imagePath,
                    encryptedEndpointConfigResponse,
                    resourceConfig,
                    existingTaskData,
                    resourceConfigServerUpdateRequired,
                    bindings
                );

                if (draftSpecsResponse.error) {
                    callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                            error: draftSpecsResponse.error,
                        },
                    });

                    return false;
                }

                if (draftSpecsResponse.data.length === 0) {
                    callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                        },
                    });

                    return false;
                }

                // this breaks when you have published something, stay on the page, and then edit agin
                setEncryptedEndpointConfig({
                    data: draftSpecsResponse.data[0].spec.endpoint.connector
                        .config,
                });

                setPreviousEndpointConfig({ data: endpointConfigData });

                setDraftId(persistedDraftId);

                void postGenerateMutate();

                return true;
            }

            return true;
        },
        [
            bindings,
            callFailed,
            draftId,
            endpointConfigData,
            imagePath,
            options?.initiateDiscovery,
            options?.initiateRediscovery,
            persistedDraftId,
            postGenerateMutate,
            processedEntityName,
            resourceConfig,
            resourceConfigServerUpdateRequired,
            setDraftId,
            setEncryptedEndpointConfig,
            setPreviousEndpointConfig,
        ]
    );
}

export default useDiscoverDraftUpdate;
