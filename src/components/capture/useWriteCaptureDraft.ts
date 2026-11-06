import type { WriteDraftFn } from 'src/components/shared/Entity/types';

import { useCallback } from 'react';

import { useSaveCaptureDraftSpec } from 'src/components/capture/useSaveCaptureDraftSpec';
import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { useAddSecretsToSpecDef } from 'src/components/shared/Entity/hooks/useAddSecretsToSpecDef';
import { useEncryptEndpointConfig } from 'src/components/shared/Entity/hooks/useEncryptEndpointConfig';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useCreateDraft } from 'src/hooks/drafts/useCreateDraft';
import { useGenerateSpecDef } from 'src/hooks/drafts/useGenerateSpecDef';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import useEntityNameSuffix from 'src/hooks/useEntityNameSuffix';
import {
    useBinding_bindings,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';
import { useDetailsForm_imagePath } from 'src/stores/DetailsForm/hooks';
import { useSecretsStore_setSecretsSaved } from 'src/stores/Secrets/hooks';
import { NEW_TASK_PUBLICATION_ID } from 'src/utils/workflow-utils';

const ERROR_TITLE = 'captureCreate.generate.failedErrorTitle';

/**
 * Callback hook that writes the workflow's capture into its draft. Create
 * starts over in a new draft, with no bindings, when there isn't one yet or
 * the name or connector changed.
 */
export function useWriteCaptureDraft(
    initiateDiscovery?: boolean
): WriteDraftFn {
    const isEdit = useEntityWorkflow_Editing();

    const encryptEndpointConfig = useEncryptEndpointConfig();
    const createDraft = useCreateDraft();

    const generateSpecDef = useGenerateSpecDef('capture');
    const getDraftSpec = useGetDraftSpec('capture');
    const saveDraftSpec = useSaveCaptureDraftSpec();
    const addSecretsToSpecDef = useAddSecretsToSpecDef();
    const setSecretsSaved = useSecretsStore_setSecretsSaved();

    const persistedDraftId = useEditorStore_persistedDraftId();
    const imagePath = useDetailsForm_imagePath();
    const bindings = useBinding_bindings();
    const resourceConfigs = useBinding_resourceConfigs();

    // If we are doing an initial discovery add the name name to the name
    // If not we are either refreshing collections during create OR during edit
    //  Refreshing during:
    //    create requires draftedEntityName because it has the connector image added to it
    //    edit   requires entityName        because it is the name already in the system and
    //                                        we do not have a draftedEntityName yet
    const catalogName = useEntityNameSuffix(!isEdit && initiateDiscovery);

    return useCallback(async () => {
        const { value: encryptedEndpointConfig, error: encryptError } =
            await encryptEndpointConfig();
        if (encryptError) {
            return { error: encryptError };
        }

        // The old capture and its collections are left behind in their draft
        const startedOver = !persistedDraftId || Boolean(initiateDiscovery);

        let draftId = persistedDraftId;
        if (!draftId || startedOver) {
            const draftRes = await createDraft(catalogName);
            if (draftRes.error) {
                return { error: { title: ERROR_TITLE, error: draftRes.error } };
            }

            draftId = draftRes.value;
        }

        // A draft that was just started has nothing drafted yet
        let existingDraftSpec = null;
        if (!startedOver) {
            const existingRes = await getDraftSpec(draftId, catalogName);
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

        // Starting over drafts no bindings, as the discover adds them
        const draftSpecDef = generateSpecDef(
            existingDraftSpec?.spec ?? null,
            { image: imagePath, config: encryptedEndpointConfig },
            startedOver ? {} : resourceConfigs,
            startedOver ? {} : bindings
        );

        // The discover and publications resolve secrets from the drafted capture
        const secretsError = await addSecretsToSpecDef(
            catalogName,
            draftSpecDef
        );
        if (secretsError) {
            return { error: { title: ERROR_TITLE, error: secretsError } };
        }

        const saveError = await saveDraftSpec(
            draftId,
            catalogName,
            expectPubId,
            draftSpecDef
        );
        if (saveError) {
            return { error: { title: ERROR_TITLE, error: saveError } };
        }

        setSecretsSaved();

        return {
            value: {
                draftId,
                catalogName,
                specDef: draftSpecDef,
                discoverRequired: startedOver,
            },
        };
    }, [
        bindings,
        catalogName,
        createDraft,
        encryptEndpointConfig,
        generateSpecDef,
        getDraftSpec,
        imagePath,
        initiateDiscovery,
        persistedDraftId,
        resourceConfigs,
        saveDraftSpec,
        addSecretsToSpecDef,
        setSecretsSaved,
    ]);
}
