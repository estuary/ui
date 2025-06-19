import type { ConnectorConfig } from 'deps/flow/flow';
import type { DraftSpecsExtQuery_ByCatalogName } from 'src/api/draftSpecs';
import type { DekafConfig } from 'src/types';

import { useCallback } from 'react';

import { createEntityDraft } from 'src/api/drafts';
import {
    createDraftSpec,
    getDraftSpecsByDraftId,
    modifyDraftSpec,
} from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
    useEditorStore_setCatalogName,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useEntityNameSuffix from 'src/hooks/useEntityNameSuffix';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import {
    useBinding_bindings,
    useBinding_fullSourceConfigs,
    useBinding_fullSourceErrorsExist,
    useBinding_prefillBindingDependentState,
    useBinding_resetRediscoverySettings,
    useBinding_resourceConfigErrorsExist,
    useBinding_resourceConfigs,
    useBinding_serverUpdateRequired,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import {
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore_sourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';
import { isDekafConnector } from 'src/utils/connector-utils';
import { encryptEndpointConfig } from 'src/utils/sops-utils';
import {
    generateTaskSpec,
    NEW_TASK_PUBLICATION_ID,
} from 'src/utils/workflow-utils';

const ENTITY_TYPE = 'materialization';

function useGenerateCatalog() {
    const isEdit = useEntityWorkflow_Editing();
    const { callFailed } = useEntityWorkflowHelpers();

    // Details Form Store
    const detailsFormsErrorsExist = useDetailsFormStore(
        (state) => state.errorsExist
    );
    const imageConnectorTagId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );
    const imageConnectorId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.connectorId
    );
    const endpointConfig: ConnectorConfig | DekafConfig = useDetailsFormStore(
        (state) =>
            isDekafConnector(state.details.data.connectorImage)
                ? {
                      config: {},
                      variant: state.details.data.connectorImage.variant,
                  }
                : {
                      config: {},
                      image: state.details.data.connectorImage.imagePath,
                  }
    );
    const setDraftedEntityName = useDetailsFormStore(
        (state) => state.setDraftedEntityName
    );
    const entityNameChanged = useDetailsFormStore(
        (state) => state.entityNameChanged
    );

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
    const prefillBindingDependentState =
        useBinding_prefillBindingDependentState();

    const fullSourceConfigs = useBinding_fullSourceConfigs();
    const fullSourceErrorsExist = useBinding_fullSourceErrorsExist();

    const specOnIncompatibleSchemaChange = useBindingStore(
        (state) => state.onIncompatibleSchemaChange
    );

    // Fetch the entire definition for source capture so we have all the settings
    const sourceCaptureDefinition =
        useSourceCaptureStore_sourceCaptureDefinition();

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
        async (mutateDraftSpecs: Function, skipStoreUpdates?: boolean) => {
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
                    const draftsResponse =
                        await createEntityDraft(processedEntityName);

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

                endpointConfig.config = encryptedEndpointConfig.data;

                const draftSpec = generateTaskSpec(
                    ENTITY_TYPE,
                    endpointConfig,
                    resourceConfigs,
                    resourceConfigServerUpdateRequired,
                    bindings,
                    existingTaskData,
                    {
                        fullSource: fullSourceConfigs,
                        sourceCaptureDefinition,
                        specOnIncompatibleSchemaChange,
                    }
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
                              ENTITY_TYPE,
                              NEW_TASK_PUBLICATION_ID
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

                if (skipStoreUpdates) {
                    return Promise.resolve(evaluatedDraftId);
                }

                // This needs to be called before mutate is called so that the
                //  useServerUpdateRequireMonitor hook is not called more than
                //  it needs to be. This is important because once the mutate is called
                //  that changes the draft spec object and that triggers the hook.
                prefillBindingDependentState(
                    ENTITY_TYPE,
                    [],
                    draftSpecsResponse.data[0].spec.bindings,
                    true
                );

                // Mutate the draft first so that we are not running
                //  update _after_ the form is showing as "done"
                await mutateDraftSpecs();

                // Update all the store state
                setCatalogName(processedEntityName);
                setEncryptedEndpointConfig({
                    data: Object.hasOwn(
                        draftSpecsResponse.data[0].spec.endpoint,
                        'dekaf'
                    )
                        ? draftSpecsResponse.data[0].spec.endpoint.dekaf.config
                        : draftSpecsResponse.data[0].spec.endpoint.connector
                              .config,
                });
                setPreviousEndpointConfig({ data: endpointConfigData });

                logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                    newValue: evaluatedDraftId,
                    component: 'useGenerateCatalog',
                });

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
            endpointConfig,
            endpointConfigData,
            endpointConfigErrorsExist,
            endpointSchema,
            fullSourceConfigs,
            fullSourceErrorsExist,
            imageConnectorId,
            imageConnectorTagId,
            persistedDraftId,
            prefillBindingDependentState,
            processedEntityName,
            resetEditorState,
            resetRediscoverySettings,
            resourceConfigErrorsExist,
            resourceConfigServerUpdateRequired,
            resourceConfigs,
            serverEndpointConfigData,
            serverUpdateRequired,
            setCatalogName,
            setDraftId,
            setDraftedEntityName,
            setEncryptedEndpointConfig,
            setFormState,
            setPersistedDraftId,
            setPreviousEndpointConfig,
            sourceCaptureDefinition,
            specOnIncompatibleSchemaChange,
            updateFormStatus,
        ]
    );
}

export default useGenerateCatalog;
