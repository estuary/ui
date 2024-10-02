import {
    getPublicationByIdQuery,
    PublicationJobStatus,
} from 'api/publications';
import { useBindingsEditorStore_setIncompatibleCollections } from 'components/editor/Bindings/Store/hooks';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useCallback } from 'react';
import {
    useFormStateStore_setFormState,
    useFormStateStore_setShowSavePrompt,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { hasLength } from 'utils/misc-utils';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';

function usePublicationHandler() {
    const { jobStatusPoller } = useJobStatusPoller();
    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

    const stepIndex = useLoopIndex();

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();

    const [updateStep, updateContext, nextStep] = usePreSavePromptStore(
        (state) => [state.updateStep, state.updateContext, state.nextStep]
    );

    const setFormState = useFormStateStore_setFormState();

    return useCallback(
        (pubId: string, goToNext?: boolean) => {
            updateContext({
                disableBack: true,
                disableClose: true,
            });

            jobStatusPoller(
                getPublicationByIdQuery(pubId),
                async (successResponse: PublicationJobStatus) => {
                    updateStep(stepIndex, {
                        publicationStatus: successResponse,
                    });

                    setFormState({
                        status: FormStatus.LOCKED,
                    });

                    if (goToNext) {
                        nextStep();
                    }
                },
                async (
                    failedResponse: any //PublicationJobStatus | PostgrestError
                ) => {
                    setFormState({
                        status: FormStatus.FAILED,
                    });

                    updateContext({
                        disableClose: false,
                        disableBack: false,
                    });

                    const incompatibleCollections =
                        failedResponse?.job_status?.incompatible_collections;

                    if (hasLength(incompatibleCollections)) {
                        setIncompatibleCollections(incompatibleCollections);
                        setShowSavePrompt(false);
                        return;
                    }

                    updateStep(stepIndex, {
                        error: failedResponse.error ? failedResponse : null,
                        publicationStatus: !failedResponse.error
                            ? failedResponse
                            : null,
                    });
                    // logRocketEvent(CustomEvents.REPUBLISH_PREFIX_FAILED);
                }
            );
        },
        [
            jobStatusPoller,
            nextStep,
            setFormState,
            setIncompatibleCollections,
            setShowSavePrompt,
            stepIndex,
            updateContext,
            updateStep,
        ]
    );
}

export default usePublicationHandler;
