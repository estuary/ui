import {
    getPublicationByIdQuery,
    PublicationJobStatus,
} from 'api/publications';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useCallback } from 'react';
import { handlePollerError } from 'services/supabase';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { hasLength } from 'utils/misc-utils';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';

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
            callback?: (response: PublicationJobStatus) => void
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

                    const hasIncompatibleCollections = hasLength(
                        failedResponse?.job_status?.incompatible_collections
                    );

                    updateStep(stepIndex, {
                        allowRetry: hasIncompatibleCollections
                            ? false
                            : undefined,
                        error: hasIncompatibleCollections
                            ? {
                                  message:
                                      'resetDataFlow.errors.incompatibleCollections',
                              }
                            : handlePollerError(failedResponse),
                        publicationStatus: !failedResponse.error
                            ? failedResponse
                            : null,
                    });
                }
            );
        },
        [jobStatusPoller, setFormState, stepIndex, updateContext, updateStep]
    );
}

export default usePublicationHandler;
