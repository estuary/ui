/* eslint-disable complexity */
import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import {
    DraftSpecsExtQuery_ByCatalogName,
    getDraftSpecsByCatalogName,
} from 'api/draftSpecs';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import useEntityNameSuffix from 'hooks/useEntityNameSuffix';
import { useCallback, useMemo } from 'react';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_connectorImage_id,
    useDetailsForm_connectorImage_imagePath,
    useDetailsForm_errorsExist,
} from 'stores/DetailsForm/hooks';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig/hooks';
import { Entity } from 'types';
import { encryptEndpointConfig } from 'utils/sops-utils';
import { modifyExistingCaptureDraftSpec } from 'utils/workflow-utils';
import useDiscoverSubscription from './useDiscoverSubscription';

function useDiscoverCapture(
    entityType: Entity,
    postGenerateMutate: Function,
    options?: { initiateRediscovery?: boolean; initiateDiscovery?: boolean }
) {
    const createDiscoversSubscription = useDiscoverSubscription(
        entityType,
        postGenerateMutate
    );

    const isEdit = useEntityWorkflow_Editing();
    const { callFailed } = useEntityWorkflowHelpers();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const setDraftId = useEditorStore_setId();
    const isSaving = useEditorStore_isSaving();
    const resetEditorState = useEditorStore_resetState();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();

    // Details Form Store
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imagePath = useDetailsForm_connectorImage_imagePath();

    // Endpoint Config Store
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();
    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const serverEndpointConfigData =
        useEndpointConfigStore_encryptedEndpointConfig_data();
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    // Resource Config Store
    const resourceConfig = useResourceConfig_resourceConfig();
    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();

    // If we are doing an initial discovery add the name name to the name
    // If not we are either refreshing collections during create OR during edit
    //  Refreshing during:
    //    create requires draftedEntityName because it has the connector image added to it
    //    edit   requires entityName        because it is the name already in the system and
    //                                        we do not have a draftedEntityName yet
    const processedEntityName = useEntityNameSuffix(
        !isEdit && options?.initiateDiscovery
    );

    const generateCatalog = useCallback(
        async (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();
            updateFormStatus(FormStatus.GENERATING);

            if (
                detailsFormsHasErrors ||
                endpointConfigErrorsExist ||
                resourceConfigHasErrors
            ) {
                return setFormState({
                    status: FormStatus.FAILED,
                    displayValidation: true,
                });
            }
            resetEditorState(true);

            const selectedEndpointConfig = serverUpdateRequired
                ? endpointConfigData
                : serverEndpointConfigData;

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
                return callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: encryptedEndpointConfig.error,
                    },
                });
            }

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
                    return callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                            error: existingDraftSpecResponse.error,
                        },
                    });
                }

                const existingTaskData: DraftSpecsExtQuery_ByCatalogName | null =
                    existingDraftSpecResponse.data &&
                    existingDraftSpecResponse.data.length > 0
                        ? existingDraftSpecResponse.data[0]
                        : null;

                const draftSpecsResponse = await modifyExistingCaptureDraftSpec(
                    persistedDraftId,
                    imagePath,
                    encryptedEndpointConfig.data,
                    resourceConfig,
                    existingTaskData
                );

                if (draftSpecsResponse.error) {
                    return callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                            error: draftSpecsResponse.error,
                        },
                    });
                }

                setEncryptedEndpointConfig({
                    data: draftSpecsResponse.data[0].spec.endpoint.connector
                        .config,
                });

                setPreviousEndpointConfig({ data: endpointConfigData });

                setDraftId(persistedDraftId);

                void postGenerateMutate();
            }

            if (options?.initiateRediscovery || options?.initiateDiscovery) {
                // If we are doing a rediscovery and we have a draft then go ahead and use that draft
                //  that way the most recent changes to bindings and endpoints will get added to the draft before rediscovery
                // This seems to be what users are expecting to happen.
                const updateBeforeRediscovery =
                    persistedDraftId && options.initiateRediscovery;

                const draftsResponse = updateBeforeRediscovery
                    ? { data: [{ id: persistedDraftId }] }
                    : await createEntityDraft(processedEntityName);

                if (draftsResponse.error) {
                    return callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                            error: draftsResponse.error,
                        },
                    });
                }

                const newDraftId = draftsResponse.data[0].id;

                const discoverResponse = await discover(
                    processedEntityName,
                    encryptedEndpointConfig.data,
                    imageConnectorTagId,
                    newDraftId
                );
                if (discoverResponse.error) {
                    return callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                            error: discoverResponse.error,
                        },
                    });
                }
                createDiscoversSubscription(newDraftId, endpointConfigData);

                setFormState({
                    logToken: discoverResponse.data[0].logs_token,
                });
            } else if (persistedDraftId) {
                // if we got here we already did the update up above
                setFormState({
                    status: FormStatus.GENERATED,
                });
            } else {
                // TODO (optimization): This condition should be nearly impossible to reach, but we currently do not have a means to produce
                //   an error in this scenario. ValidationErrorSummary is not suitable for this scenario and EntityError, the error component
                //   that surfaces form state errors, is only rendered in the event a persisted draft ID is present. Since the likelihood of
                //   reaching this code block is slim, I am going to add a solution in a fast-follow to the schema inference changes.
            }
        },
        [
            callFailed,
            createDiscoversSubscription,
            detailsFormsHasErrors,
            draftId,
            endpointConfigData,
            endpointConfigErrorsExist,
            endpointSchema,
            imageConnectorId,
            imageConnectorTagId,
            imagePath,
            options?.initiateDiscovery,
            options?.initiateRediscovery,
            persistedDraftId,
            postGenerateMutate,
            processedEntityName,
            resetEditorState,
            resourceConfig,
            resourceConfigHasErrors,
            serverEndpointConfigData,
            serverUpdateRequired,
            setDraftId,
            setEncryptedEndpointConfig,
            setFormState,
            setPreviousEndpointConfig,
            updateFormStatus,
        ]
    );

    return useMemo(() => {
        return {
            isSaving,
            formActive,
            generateCatalog,
            discoversSubscription: createDiscoversSubscription,
        };
    }, [createDiscoversSubscription, generateCatalog, formActive, isSaving]);
}

export default useDiscoverCapture;
