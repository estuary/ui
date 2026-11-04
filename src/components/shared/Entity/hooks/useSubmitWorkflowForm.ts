import type { WriteDraftFn } from 'src/components/shared/Entity/types';

import { useCallback } from 'react';

import { useStartDiscover } from 'src/components/capture/useStartDiscover';
import {
    useEditorStore_resetState,
    useEditorStore_setCatalogName,
} from 'src/components/editor/Store/hooks';
import { useApplyDraftToWorkflow } from 'src/components/shared/Entity/hooks/useApplyDraftToWorkflow';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useValidateWorkflowForms } from 'src/components/shared/Entity/hooks/useValidateWorkflowForms';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useFormStateStore_updateStatus } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

/**
 * Callback hook for the workflow's Next step: validates the forms and writes
 * the task into its draft with `writeDraft`. A capture in a new draft, or a
 * requested rediscovery, starts a discover; otherwise the workflow is pointed
 * at the draft. Resolves to the draft ID, or null once a failure has been
 * reported to the form.
 *
 * `initiateRediscovery` is for captures.
 */
export function useSubmitWorkflowForm(
    writeDraft: WriteDraftFn,
    options?: { initiateRediscovery?: boolean }
) {
    const validateForms = useValidateWorkflowForms();
    const startDiscover = useStartDiscover();
    const applyDraft = useApplyDraftToWorkflow();
    const { callFailed } = useEntityWorkflowHelpers();

    const updateFormStatus = useFormStateStore_updateStatus();
    const resetEditorState = useEditorStore_resetState();
    const setCatalogName = useEditorStore_setCatalogName();

    const dataPlaneName = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.dataPlaneName
    );

    return useCallback(
        async (requestFieldValidation?: boolean): Promise<string | null> => {
            updateFormStatus(FormStatus.GENERATING);

            if (!validateForms()) {
                return null;
            }

            resetEditorState(true);

            const { value: writtenDraft, error } = await writeDraft();
            if (error) {
                callFailed({ error });
                return null;
            }

            const { draftId, catalogName, specDef, discoverRequired } =
                writtenDraft;

            if (discoverRequired || options?.initiateRediscovery) {
                setCatalogName(catalogName);

                const discovered = await startDiscover(
                    draftId,
                    catalogName,
                    dataPlaneName?.whole
                );

                return discovered ? draftId : null;
            }

            await applyDraft({
                draftId,
                catalogName,
                specDef,
                requestFieldValidation,
            });

            return draftId;
        },
        [
            applyDraft,
            callFailed,
            dataPlaneName?.whole,
            options?.initiateRediscovery,
            resetEditorState,
            setCatalogName,
            startDiscover,
            updateFormStatus,
            validateForms,
            writeDraft,
        ]
    );
}
