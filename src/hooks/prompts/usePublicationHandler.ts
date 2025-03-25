import type { PublicationJobStatus } from 'api/publications';
import { getPublicationByIdQuery } from 'api/publications';
import { usePreSavePromptStore } from 'components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useCallback } from 'react';
import { handlePollerError } from 'services/supabase';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

function usePublicationHandler() {
    const { jobStatusPoller } = useJobStatusPoller();
    const stepIndex = useLoopIndex();
    const [updateStep, updateContext] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.updateContext,
    ]);

    const setFormState = useFormStateStore_setFormState();

    return useCallback(
        (
            pubId: string,
            callback?: (response: PublicationJobStatus | any) => void
        ) => {
            // Once we start publishing we do not want the user clicking around
            updateContext({
                disableBack: true,
                disableClose: true,
            });

            // We want to stop retry while polling as a publish step only
            //  wants to allow retrying if it failed to make the publication
            //  not failed due to not getting the status
            updateStep(stepIndex, {
                allowRetry: false,
            });

            jobStatusPoller(
                getPublicationByIdQuery(pubId),
                async (successResponse: PublicationJobStatus) => {
                    updateStep(stepIndex, {
                        publicationStatus: successResponse,
                    });

                    // Once we have published one lock the form down. This is because
                    //  if we have disabled capture we used the user's draft to do that
                    //  and they can not go back to the form and edit anything
                    setFormState({
                        status: FormStatus.LOCKED,
                    });

                    if (callback) {
                        callback(successResponse);
                    }
                },
                async (
                    failedResponse: any //PublicationJobStatus | PostgrestError
                ) => {
                    setFormState({
                        status: FormStatus.FAILED,
                        exitWhenLogsClose: false,
                    });

                    updateContext({
                        disableClose: false,
                        disableBack: false,
                    });

                    updateStep(stepIndex, {
                        error: handlePollerError(failedResponse),
                        publicationStatus: !failedResponse.error
                            ? failedResponse
                            : null,
                    });

                    if (callback) {
                        callback(failedResponse);
                    }
                }
            );
        },
        [jobStatusPoller, setFormState, stepIndex, updateContext, updateStep]
    );
}

export default usePublicationHandler;
