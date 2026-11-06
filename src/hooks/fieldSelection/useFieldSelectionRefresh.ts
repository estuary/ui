import { useCallback } from 'react';

import { useWriteMaterializationDraft } from 'src/components/materialization/useWriteMaterializationDraft';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { usePublishDraft } from 'src/components/shared/Entity/hooks/usePublishDraft';
import { useSubmitWorkflowForm } from 'src/components/shared/Entity/hooks/useSubmitWorkflowForm';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBindingStore } from 'src/stores/Binding/Store';

function useFieldSelectionRefresh() {
    const { callFailed } = useEntityWorkflowHelpers();

    const writeDraft = useWriteMaterializationDraft();
    const submitForm = useSubmitWorkflowForm(writeDraft);

    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );

    const saveCatalog = usePublishDraft(
        CustomEvents.MATERIALIZATION_TEST,
        callFailed,
        true
    );

    const refresh = useCallback(
        async (draftIdToUse?: string | null) => {
            advanceHydrationStatus('HYDRATED', undefined, true);

            let evaluatedDraftId = draftIdToUse;
            if (!evaluatedDraftId) {
                try {
                    evaluatedDraftId = await submitForm(true);
                } catch (error: unknown) {
                    logRocketConsole('field selection error', error);
                    evaluatedDraftId = null;
                } finally {
                    advanceHydrationStatus('RESET_REQUESTED');
                }

                // A reported failure is already shown on the form
                if (!evaluatedDraftId) {
                    logRocketEvent(CustomEvents.FIELD_SELECTION, {
                        error: true,
                    });
                }
            }

            // Make sure we have a draft id so we know the generate worked
            //  if this is not returned then the function itself handled showing an error
            if (evaluatedDraftId) {
                try {
                    const onError = (dryRun: boolean | undefined) => {
                        if (!dryRun) {
                            return;
                        }

                        advanceHydrationStatus(
                            'SERVER_UPDATING',
                            undefined,
                            undefined,
                            true
                        );
                    };

                    const onFinish = (dryRun: boolean | undefined) => {
                        if (!dryRun) {
                            return;
                        }

                        advanceHydrationStatus('SERVER_UPDATING');
                    };

                    await saveCatalog(
                        evaluatedDraftId,
                        true,
                        onFinish,
                        onError
                    );
                } catch (error: unknown) {
                    logRocketEvent(CustomEvents.FIELD_SELECTION, {
                        error: true,
                    });
                    logRocketConsole('field selection error', error);
                }
            }
        },
        [advanceHydrationStatus, submitForm, saveCatalog]
    );

    return {
        refresh,
    };
}

export default useFieldSelectionRefresh;
