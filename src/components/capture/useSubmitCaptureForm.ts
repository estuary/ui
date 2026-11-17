import type { FormError } from 'src/stores/FormState/types';
import type { Schema } from 'src/types';
import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import { useStartDiscover } from 'src/components/capture/useStartDiscover';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
    useEditorStore_setCatalogName,
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
import {
    useBinding_bindings,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_updateStatus } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { isDekafConnector } from 'src/utils/connector-utils';

const ERROR_TITLE = 'captureCreate.generate.failedErrorTitle';

/**
 * Callback hook for the capture workflow's Next step: validates the forms and
 * writes the capture into its draft. A new draft, or a requested rediscovery,
 * starts a discover; otherwise the workflow is pointed at the draft. Resolves
 * to whether it succeeded.
 */
export function useSubmitCaptureForm(options?: {
    initiateRediscovery?: boolean;
    initiateDiscovery?: boolean;
}) {
    const validateForms = useValidateWorkflowForms();
    const writeDraft = useWriteCaptureDraft(options?.initiateDiscovery);
    const startDiscover = useStartDiscover();
    const applyDraft = useApplyDraftToWorkflow();
    const { callFailed } = useEntityWorkflowHelpers();
    const mutateDraftSpec = useMutateDraftSpec();

    const updateFormStatus = useFormStateStore_updateStatus();
    const resetEditorState = useEditorStore_resetState();
    const setCatalogName = useEditorStore_setCatalogName();

    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName
    );

    return useCallback(async () => {
        updateFormStatus(FormStatus.GENERATING);

        if (!validateForms()) {
            return false;
        }

        resetEditorState(true);

        const { value: written, error } = await writeDraft();
        if (error) {
            callFailed({ error });
            return false;
        }

        const { draftId, catalogName, encryptedEndpointConfig, startedOver } =
            written;

        setCatalogName(catalogName);

        if (startedOver || options?.initiateRediscovery) {
            return startDiscover(draftId, catalogName, dataPlaneName?.whole);
        }

        // this breaks when you have published something, stay on the page, and then edit agin
        void mutateDraftSpec();
        applyDraft({ draftId, catalogName, encryptedEndpointConfig });

        return true;
    }, [
        applyDraft,
        callFailed,
        dataPlaneName?.whole,
        mutateDraftSpec,
        options?.initiateRediscovery,
        resetEditorState,
        setCatalogName,
        startDiscover,
        updateFormStatus,
        validateForms,
        writeDraft,
    ]);
}

interface WrittenCaptureDraft {
    draftId: string;
    catalogName: string;
    encryptedEndpointConfig: Schema;
    // A new draft was started, so the capture needs a discover
    startedOver: boolean;
}

/**
 * Callback hook that writes the workflow's capture into its draft. Create
 * starts over in a new draft, with no bindings, when there isn't one yet or
 * the name or connector changed.
 */
function useWriteCaptureDraft(initiateDiscovery?: boolean) {
    const isEdit = useEntityWorkflow_Editing();

    const encryptEndpointConfig = useEncryptEndpointConfig();
    const createDraft = useCreateDraft();
    const getDraftSpec = useGetDraftSpec('capture');
    const generateDraftSpec = useGenerateDraftSpec('capture');
    const saveDraftSpec = useSaveDraftSpec('capture');

    const persistedDraftId = useEditorStore_persistedDraftId();
    const imagePath = useDetailsFormStore((state) =>
        isDekafConnector(state.details.data.connectorImage)
            ? ''
            : state.details.data.connectorImage.imagePath
    );
    const bindings = useBinding_bindings();
    const resourceConfigs = useBinding_resourceConfigs();

    // If we are doing an initial discovery add the name name to the name
    // If not we are either refreshing collections during create OR during edit
    //  Refreshing during:
    //    create requires draftedEntityName because it has the connector image added to it
    //    edit   requires entityName        because it is the name already in the system and
    //                                        we do not have a draftedEntityName yet
    const catalogName = useEntityNameSuffix(!isEdit && initiateDiscovery);

    return useCallback(async (): Promise<
        Result<WrittenCaptureDraft, FormError>
    > => {
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

        // Starting over drafts no bindings, as the discover adds them
        const draftSpec = generateDraftSpec(
            existingDraftSpec,
            { image: imagePath, config: encryptedEndpointConfig },
            startedOver ? {} : resourceConfigs,
            startedOver ? {} : bindings
        );

        const { error: draftSpecError } = await saveDraftSpec(
            draftId,
            catalogName,
            draftSpec
        );
        if (draftSpecError) {
            return { error: { title: ERROR_TITLE, error: draftSpecError } };
        }

        return {
            value: {
                draftId,
                catalogName,
                encryptedEndpointConfig,
                startedOver,
            },
        };
    }, [
        bindings,
        catalogName,
        createDraft,
        encryptEndpointConfig,
        generateDraftSpec,
        getDraftSpec,
        imagePath,
        initiateDiscovery,
        persistedDraftId,
        resourceConfigs,
        saveDraftSpec,
    ]);
}
