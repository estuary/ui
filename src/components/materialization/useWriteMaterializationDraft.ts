import type { WriteDraftFn } from 'src/components/shared/Entity/types';

import { useCallback, useMemo } from 'react';

import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { useAddSecretsToSpecDef } from 'src/components/shared/Entity/hooks/useAddSecretsToSpecDef';
import { useEncryptEndpointConfig } from 'src/components/shared/Entity/hooks/useEncryptEndpointConfig';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useCreateDraft } from 'src/hooks/drafts/useCreateDraft';
import { useGenerateSpecDef } from 'src/hooks/drafts/useGenerateSpecDef';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import { useSaveDraftSpec } from 'src/hooks/drafts/useSaveDraftSpec';
import useEntityNameSuffix from 'src/hooks/useEntityNameSuffix';
import {
    useBinding_bindings,
    useBinding_fullSourceConfigs,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useDetailsForm_endpointConfig } from 'src/stores/DetailsForm/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useSecretsStore_setSecretsSaved } from 'src/stores/Secrets/hooks';
import { useSourceCaptureStore_sourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';
import { useTargetNamingStore } from 'src/stores/TargetNaming/Store';
import { NEW_TASK_PUBLICATION_ID } from 'src/utils/workflow-utils';

const ERROR_TITLE = 'materializationCreate.generate.failure.errorTitle';

/**
 * Callback hook that writes the workflow's materialization into its draft,
 * starting a draft if there isn't one yet.
 */
export function useWriteMaterializationDraft(): WriteDraftFn {
    const isEdit = useEntityWorkflow_Editing();

    const encryptEndpointConfig = useEncryptEndpointConfig();
    const createDraft = useCreateDraft();

    const generateSpecDef = useGenerateSpecDef('materialization');
    const getDraftSpec = useGetDraftSpec('materialization');
    const saveDraftSpec = useSaveDraftSpec('materialization');
    const addSecretsToSpecDef = useAddSecretsToSpecDef();
    const setSecretsSaved = useSecretsStore_setSecretsSaved();

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

    return useCallback(async () => {
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

        // Keep the drafted precondition, even none (null), or expect no live
        // spec for a new task
        const expectPubId = existingDraftSpec
            ? existingDraftSpec.expect_pub_id
            : NEW_TASK_PUBLICATION_ID;

        const generatedDraftSpec = generateSpecDef(
            existingDraftSpec?.spec ?? null,
            { ...endpointConfig, config: encryptedEndpointConfig },
            resourceConfigs,
            bindings,
            specOptions
        );

        // Publications resolve secrets from the drafted materialization
        const secretsError = await addSecretsToSpecDef(
            processedEntityName,
            generatedDraftSpec
        );
        if (secretsError) {
            return { error: { title: ERROR_TITLE, error: secretsError } };
        }

        const saveError = await saveDraftSpec(
            draftId,
            processedEntityName,
            expectPubId,
            generatedDraftSpec
        );
        if (saveError) {
            return { error: { title: ERROR_TITLE, error: saveError } };
        }

        setSecretsSaved();

        return {
            value: {
                draftId,
                catalogName: processedEntityName,
                specDef: generatedDraftSpec,
            },
        };
    }, [
        bindings,
        createDraft,
        encryptEndpointConfig,
        endpointConfig,
        generateSpecDef,
        getDraftSpec,
        persistedDraftId,
        processedEntityName,
        resourceConfigs,
        saveDraftSpec,
        specOptions,
        addSecretsToSpecDef,
        setSecretsSaved,
    ]);
}
