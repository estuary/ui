import {
    DraftSpecsExtQuery_ByCatalogName,
    getDraftSpecsByCatalogName,
} from 'api/draftSpecs';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import useEntityNameSuffix from 'hooks/useEntityNameSuffix';
import { useCallback } from 'react';
import { useDetailsForm_connectorImage_imagePath } from 'stores/DetailsForm/hooks';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'stores/EndpointConfig/hooks';

import { useResourceConfig_resourceConfig } from 'stores/ResourceConfig/hooks';
import { modifyExistingCaptureDraftSpec } from 'utils/workflow-utils';

function useDiscoverDraftUpdate(
    postGenerateMutate: Function,
    options?: { initiateRediscovery?: boolean; initiateDiscovery?: boolean }
) {
    const isEdit = useEntityWorkflow_Editing();
    const { callFailed } = useEntityWorkflowHelpers();

    const draftId = useEditorStore_id();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const setDraftId = useEditorStore_setId();

    const imagePath = useDetailsForm_connectorImage_imagePath();

    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    const resourceConfig = useResourceConfig_resourceConfig();

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
                (!draftId && persistedDraftId && !options?.initiateDiscovery) ||
                (persistedDraftId &&
                    !options?.initiateDiscovery &&
                    !options?.initiateRediscovery)
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
                    existingTaskData
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
            setDraftId,
            setEncryptedEndpointConfig,
            setPreviousEndpointConfig,
        ]
    );
}

export default useDiscoverDraftUpdate;
