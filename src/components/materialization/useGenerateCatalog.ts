import { createEntityDraft } from 'api/drafts';
import {
    createDraftSpec,
    DraftSpecsExtQuery_ByCatalogName,
    getDraftSpecsByDraftId,
    modifyDraftSpec,
} from 'api/draftSpecs';
import {
    useBindingsEditorStore_fullSourceConfigs,
    useBindingsEditorStore_fullSourceErrorsExist,
} from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
    useEditorStore_setCatalogName,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import invariableStores from 'context/Zustand/invariableStores';
import useEntityNameSuffix from 'hooks/useEntityNameSuffix';
import { useCallback } from 'react';
import {
    useBinding_bindings,
    useBinding_resetRediscoverySettings,
    useBinding_resourceConfigErrorsExist,
    useBinding_resourceConfigs,
    useBinding_serverUpdateRequired,
} from 'stores/Binding/hooks';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_connectorImage_id,
    useDetailsForm_connectorImage_imagePath,
    useDetailsForm_entityNameChanged,
    useDetailsForm_errorsExist,
    useDetailsForm_setDraftedEntityName,
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
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { encryptEndpointConfig } from 'utils/sops-utils';
import { generateTaskSpec } from 'utils/workflow-utils';
import { useStore } from 'zustand';

const ENTITY_TYPE = 'materialization';

function useGenerateCatalog() {
    const isEdit = useEntityWorkflow_Editing();
    const { callFailed } = useEntityWorkflowHelpers();

    // Details Form Store
    const detailsFormsErrorsExist = useDetailsForm_errorsExist();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();
    const imagePath = useDetailsForm_connectorImage_imagePath();
    const setDraftedEntityName = useDetailsForm_setDraftedEntityName();
    const entityNameChanged = useDetailsForm_entityNameChanged();

    // Draft Editor Store
    const resetEditorState = useEditorStore_resetState();
    const setDraftId = useEditorStore_setId();
    const persistedDraftId = useEditorStore_persistedDraftId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();
    const setCatalogName = useEditorStore_setCatalogName();

    // Endpoint Config Store
    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const serverEndpointConfigData =
        useEndpointConfigStore_encryptedEndpointConfig_data();
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();

    // Binding Store
    const bindings = useBinding_bindings();
    const resourceConfigs = useBinding_resourceConfigs();
    const resourceConfigErrorsExist = useBinding_resourceConfigErrorsExist();
    const resetRediscoverySettings = useBinding_resetRediscoverySettings();
    const resourceConfigServerUpdateRequired =
        useBinding_serverUpdateRequired();

    // Bindings Editor store
    const fullSourceConfigs = useBindingsEditorStore_fullSourceConfigs();
    const fullSourceErrorsExist =
        useBindingsEditorStore_fullSourceErrorsExist();

    // Source Capture Store
    const sourceCapture = useStore(
        invariableStores['source-capture'],
        (state) => state.sourceCapture
    );

    // After the first generation we already have a name with the
    //  image name suffix (unless name changed)

    // The order of the OR statement below is SUPER important because the
    //  entity name change variable will flip to true more often
    //      If there is NO persisted draft ID
    //          - process the name
    //      If there is a persisted draft ID BUT the name changed
    //          - process the name
    //      If there is persisted draft ID
    //          - get the draft name
    const processedEntityName = useEntityNameSuffix(
        !isEdit && (!persistedDraftId || entityNameChanged)
    );

    return useCallback(
        async (mutateDraftSpecs: Function) => {
            updateFormStatus(FormStatus.GENERATING);

            if (
                resourceConfigErrorsExist ||
                detailsFormsErrorsExist ||
                endpointConfigErrorsExist ||
                fullSourceErrorsExist
            ) {
                setFormState({
                    status: FormStatus.FAILED,
                    displayValidation: true,
                });

                return Promise.reject(null);
            } else {
                resetEditorState(true);

                const encryptedEndpointConfig = await encryptEndpointConfig(
                    serverUpdateRequired
                        ? endpointConfigData
                        : serverEndpointConfigData,
                    endpointSchema,
                    serverUpdateRequired,
                    imageConnectorId,
                    imageConnectorTagId,
                    callFailed,
                    { overrideJsonFormDefaults: true }
                );

                let evaluatedDraftId = persistedDraftId;
                let existingTaskData: DraftSpecsExtQuery_ByCatalogName | null =
                    null;

                if (persistedDraftId) {
                    // See if there is an existing materialization tied to the persisted draft id
                    const existingDraftSpecResponse =
                        await getDraftSpecsByDraftId(
                            persistedDraftId,
                            ENTITY_TYPE
                        );

                    if (existingDraftSpecResponse.error) {
                        callFailed({
                            error: {
                                title: 'materializationCreate.generate.failure.errorTitle',
                                error: existingDraftSpecResponse.error,
                            },
                        });

                        return Promise.reject(null);
                    }

                    // Populate the existing if available. This might not exist if the user edited a collection
                    //  as their first action before clicking this button
                    if (
                        existingDraftSpecResponse.data &&
                        existingDraftSpecResponse.data.length > 0
                    ) {
                        existingTaskData = existingDraftSpecResponse.data[0];
                    }
                } else {
                    // No existing draft so start a new one
                    const draftsResponse = await createEntityDraft(
                        processedEntityName
                    );

                    if (draftsResponse.error) {
                        callFailed({
                            error: {
                                title: 'materializationCreate.generate.failure.errorTitle',
                                error: draftsResponse.error,
                            },
                        });
                        return Promise.reject(null);
                    }

                    // Since we made a new one override the current draft id
                    evaluatedDraftId = draftsResponse.data[0].id;
                }

                // Generate the draft spec that will be sent to the server next
                const draftSpec = generateTaskSpec(
                    ENTITY_TYPE,
                    { image: imagePath, config: encryptedEndpointConfig.data },
                    resourceConfigs,
                    resourceConfigServerUpdateRequired,
                    bindings,
                    existingTaskData,
                    { fullSource: fullSourceConfigs, sourceCapture }
                );

                // If there is a draft already with task data then update. We do not match on
                //   the catalog name as the user could change the name. There is a small issue
                //      if someone updates their draft on the CLI and adds multiple materializations
                //      there will be an issue. This will need to be handled eventually but by then
                //      we should move the UI to the "shopping cart" approach.
                const draftSpecsResponse =
                    persistedDraftId && existingTaskData
                        ? await modifyDraftSpec(
                              draftSpec,
                              {
                                  draft_id: evaluatedDraftId,
                                  spec_type: ENTITY_TYPE,
                              },
                              processedEntityName
                          )
                        : await createDraftSpec(
                              evaluatedDraftId,
                              processedEntityName,
                              draftSpec,
                              ENTITY_TYPE
                          );

                if (draftSpecsResponse.error) {
                    callFailed({
                        error: {
                            title: 'materializationCreate.generate.failure.errorTitle',
                            error: draftSpecsResponse.error,
                        },
                    });
                    return Promise.reject(null);
                }

                // Mutate the draft first so that we are not running
                //  update _after_ the form is showing as "done" wit hthe update
                await mutateDraftSpecs();

                // Update all the store state
                setCatalogName(processedEntityName);
                setEncryptedEndpointConfig({
                    data: draftSpecsResponse.data[0].spec.endpoint.connector
                        .config,
                });
                setPreviousEndpointConfig({ data: endpointConfigData });
                setDraftId(evaluatedDraftId);
                setPersistedDraftId(evaluatedDraftId);
                setDraftedEntityName(draftSpecsResponse.data[0].catalog_name);
                setFormState({
                    status: FormStatus.GENERATED,
                });

                // Materializations do not use this setting but still letting it get populated to keep
                //  the stores simpler. Also, I could easily see us needing to know what collections
                //  were enabled during an edit in materializations.
                resetRediscoverySettings();

                //  TODO (Reuse)
                //  Eventually, we might want to come up with a good pattern of how async functions return the results of their updates
                //  especially when they make several calls. Maybe we do not worry about it and just handle case by case... but feels like
                //  something we could use a good approach to.

                // Need to pass the draftId so that other places that use this function (`see fields` button) can do other stuff with it.
                return Promise.resolve(evaluatedDraftId);
            }
        },
        [
            bindings,
            callFailed,
            detailsFormsErrorsExist,
            endpointConfigData,
            endpointConfigErrorsExist,
            endpointSchema,
            fullSourceConfigs,
            fullSourceErrorsExist,
            imageConnectorId,
            imageConnectorTagId,
            imagePath,
            persistedDraftId,
            processedEntityName,
            resetEditorState,
            resetRediscoverySettings,
            resourceConfigs,
            resourceConfigErrorsExist,
            resourceConfigServerUpdateRequired,
            serverEndpointConfigData,
            serverUpdateRequired,
            setCatalogName,
            setDraftId,
            setDraftedEntityName,
            setEncryptedEndpointConfig,
            setFormState,
            setPersistedDraftId,
            setPreviousEndpointConfig,
            sourceCapture,
            updateFormStatus,
        ]
    );
}

export default useGenerateCatalog;
