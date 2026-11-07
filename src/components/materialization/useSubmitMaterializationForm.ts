import type { MaterializationsDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import type { FormError } from 'src/stores/FormState/types';
import type { Schema } from 'src/types';
import type { Result } from 'src/types/utils';

import { useCallback, useMemo } from 'react';

import {
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
} from 'src/components/editor/Store/hooks';
import { useApplyDraftToWorkflow } from 'src/components/shared/Entity/hooks/useApplyDraftToWorkflow';
import { useEncryptEndpointConfig } from 'src/components/shared/Entity/hooks/useEncryptEndpointConfig';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useValidateWorkflowForms } from 'src/components/shared/Entity/hooks/useValidateWorkflowForms';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useCreateDraft } from 'src/hooks/drafts/useCreateDraft';
import { useGenerateDraftSpec } from 'src/hooks/drafts/useGenerateDraftSpec';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import { useSaveDraftSpec } from 'src/hooks/drafts/useSaveDraftSpec';
import useEntityNameSuffix from 'src/hooks/useEntityNameSuffix';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import {
    useBinding_bindings,
    useBinding_fullSourceConfigs,
    useBinding_prefillBindingDependentState,
    useBinding_resetRediscoverySettings,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useDetailsForm_endpointConfig } from 'src/stores/DetailsForm/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_updateStatus } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore_sourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';
import { useTargetNamingStore } from 'src/stores/TargetNaming/Store';

const ERROR_TITLE = 'materializationCreate.generate.failure.errorTitle';

/**
 * Callback hook for the materialization workflow's Next step: validates the
 * forms, writes the materialization into its draft, and points the workflow
 * at that draft. Resolves to the draft ID, or rejects once the failure has
 * been reported to the form.
 */
export function useSubmitMaterializationForm() {
    const validateForms = useValidateWorkflowForms();
    const writeDraft = useWriteMaterializationDraft();
    const applyDraft = useApplyDraftToWorkflow();
    const { callFailed } = useEntityWorkflowHelpers();
    const mutateDraftSpec = useMutateDraftSpec();

    const updateFormStatus = useFormStateStore_updateStatus();
    const resetEditorState = useEditorStore_resetState();

    const prefillBindingDependentState =
        useBinding_prefillBindingDependentState();
    const resetRediscoverySettings = useBinding_resetRediscoverySettings();
    const resetResourceConfigAddedMetadata = useBindingStore(
        (state) => state.resetResourceConfigAddedMetadata
    );

    return useCallback(
        async (requestFieldValidation?: boolean) => {
            updateFormStatus(FormStatus.GENERATING);

            if (!validateForms()) {
                return Promise.reject(null);
            }

            resetEditorState(true);

            const { value: written, error } = await writeDraft();
            if (error) {
                callFailed({ error });
                return Promise.reject(null);
            }

            const { draftId, catalogName, draftSpec, encryptedEndpointConfig } =
                written;

            // This needs to be called before mutate is called so that the
            //  useServerUpdateRequireMonitor hook is not called more than
            //  it needs to be. This is important because once the mutate is called
            //  that changes the draft spec object and that triggers the hook.
            prefillBindingDependentState(
                'materialization',
                [],
                draftSpec.spec.bindings,
                true,
                requestFieldValidation
            );

            // Mutate the draft first so that we are not running
            //  update _after_ the form is showing as "done"
            await mutateDraftSpec();

            resetResourceConfigAddedMetadata();

            logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                newValue: draftId,
                component: 'useSubmitMaterializationForm',
            });

            applyDraft({
                draftId,
                catalogName,
                encryptedEndpointConfig,
            });

            // Materializations do not use this setting but still letting it get populated to keep
            //  the stores simpler. Also, I could easily see us needing to know what collections
            //  were enabled during an edit in materializations.
            resetRediscoverySettings();

            // Need to pass the draftId so that other places that use this function (`see fields` button) can do other stuff with it.
            return draftId;
        },
        [
            applyDraft,
            callFailed,
            mutateDraftSpec,
            prefillBindingDependentState,
            resetEditorState,
            resetRediscoverySettings,
            resetResourceConfigAddedMetadata,
            updateFormStatus,
            validateForms,
            writeDraft,
        ]
    );
}

interface WrittenMaterializationDraft {
    draftId: string;
    catalogName: string;
    draftSpec: MaterializationsDraftSpec;
    encryptedEndpointConfig: Schema;
}

/**
 * Callback hook that writes the workflow's materialization into its draft,
 * starting a draft if there isn't one yet.
 */
function useWriteMaterializationDraft() {
    const isEdit = useEntityWorkflow_Editing();

    const encryptEndpointConfig = useEncryptEndpointConfig();
    const createDraft = useCreateDraft();
    const getDraftSpec = useGetDraftSpec('materialization');
    const generateDraftSpec = useGenerateDraftSpec('materialization');
    const saveDraftSpec = useSaveDraftSpec('materialization');

    const persistedDraftId = useEditorStore_persistedDraftId();
    const endpointConfig = useDetailsForm_endpointConfig();
    const entityNameChanged = useDetailsFormStore(
        (state) => state.entityNameChanged
    );
    const bindings = useBinding_bindings();
    const resourceConfigs = useBinding_resourceConfigs();

    // spec options
    const fullSource = useBinding_fullSourceConfigs();
    const specOnIncompatibleSchemaChange = useBindingStore(
        (state) => state.onIncompatibleSchemaChange
    );
    // The entire definition for source capture so we have all the settings
    const sourceCaptureDefinition =
        useSourceCaptureStore_sourceCaptureDefinition();
    const targetNamingModel = useTargetNamingStore((state) => state.model);
    const targetNamingStrategy = useTargetNamingStore(
        (state) => state.targetNamingStrategy
    );

    const specOptions = useMemo(
        () => ({
            fullSource,
            sourceCaptureDefinition,
            specOnIncompatibleSchemaChange,
            defaultFieldsRecommended: !isEdit,
            targetNamingModel,
            targetNamingStrategy,
        }),
        [
            fullSource,
            isEdit,
            sourceCaptureDefinition,
            specOnIncompatibleSchemaChange,
            targetNamingModel,
            targetNamingStrategy,
        ]
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

    return useCallback(async (): Promise<
        Result<WrittenMaterializationDraft, FormError>
    > => {
        let draftId = persistedDraftId;
        if (!draftId) {
            const draftRes = await createDraft(processedEntityName);
            if (draftRes.error) {
                return { error: { title: ERROR_TITLE, error: draftRes.error } };
            }

            draftId = draftRes.value;
        }

        const { value: encryptedEndpointConfig, error: encryptError } =
            await encryptEndpointConfig();
        if (encryptError) {
            return { error: encryptError };
        }

        // Matched by type, so a renamed materialization keeps its drafted spec.
        //  A draft that was just started has nothing drafted yet.
        let existingDraftSpec = null;
        if (persistedDraftId) {
            const existingRes = await getDraftSpec(draftId);
            if (existingRes.error) {
                return {
                    error: { title: ERROR_TITLE, error: existingRes.error },
                };
            }

            existingDraftSpec = existingRes.value;
        }

        const generatedDraftSpec = generateDraftSpec(
            existingDraftSpec,
            { ...endpointConfig, config: encryptedEndpointConfig },
            resourceConfigs,
            bindings,
            specOptions
        );

        const { value: draftSpec, error: draftSpecError } = await saveDraftSpec(
            draftId,
            processedEntityName,
            generatedDraftSpec,
            Boolean(existingDraftSpec)
        );
        if (draftSpecError) {
            return { error: { title: ERROR_TITLE, error: draftSpecError } };
        }

        return {
            value: {
                draftId,
                catalogName: processedEntityName,
                draftSpec,
                encryptedEndpointConfig,
            },
        };
    }, [
        bindings,
        createDraft,
        encryptEndpointConfig,
        endpointConfig,
        generateDraftSpec,
        getDraftSpec,
        persistedDraftId,
        processedEntityName,
        resourceConfigs,
        saveDraftSpec,
        specOptions,
    ]);
}
