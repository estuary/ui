import { modifyDraftSpec } from 'api/draftSpecs';
import {
    createPublication,
    getPublicationByIdQuery,
    PublicationJobStatus,
} from 'api/publications';
import { useBindingsEditorStore_setIncompatibleCollections } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useMount } from 'react-use';
import {
    useFormStateStore_setFormState,
    useFormStateStore_setShowSavePrompt,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { generateDisabledSpec } from 'utils/entity-utils';
import { hasLength } from 'utils/misc-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function DisableCapture() {
    const draftId = useEditorStore_id();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const { jobStatusPoller } = useJobStatusPoller();
    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const setShowSavePrompt = useFormStateStore_setShowSavePrompt();

    const [updateStep, updateContext, nextStep, initUUID] =
        usePreSavePromptStore((state) => [
            state.updateStep,
            state.updateContext,
            state.nextStep,
            state.initUUID,
        ]);

    const setFormState = useFormStateStore_setFormState();

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            setFormState({
                status: FormStatus.SAVING,
                exitWhenLogsClose: true,
            });

            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            updateContext({
                disableClose: true,
            });

            const disableCaptureAndPublish = async () => {
                const newSpec = generateDisabledSpec(
                    draftSpecs[0].spec,
                    false,
                    false
                );

                const captureName = draftSpecs[0].catalog_name;

                // Update the Capture to be disabled
                const updateResponse = await modifyDraftSpec(
                    newSpec,
                    {
                        draft_id: draftId,
                        catalog_name: captureName,
                        spec_type: 'capture',
                    },
                    undefined,
                    undefined,
                    `data flow backfill : disable capture : ${initUUID}`
                );

                if (updateResponse.error) {
                    updateStep(stepIndex, {
                        error: updateResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                // Start publishing it
                const publishResponse = await createPublication(
                    draftId,
                    false,
                    `data flow backfill : disable capture : ${initUUID}`
                );

                if (publishResponse.error || !publishResponse.data) {
                    updateStep(stepIndex, {
                        error: publishResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                updateContext({
                    captureName,
                    captureSpec: newSpec,
                    initialPubId: publishResponse.data[0].id,
                });

                jobStatusPoller(
                    getPublicationByIdQuery(publishResponse.data[0].id),
                    async (successResponse: PublicationJobStatus) => {
                        updateStep(stepIndex, {
                            publicationStatus: successResponse,
                        });

                        setFormState({
                            status: FormStatus.LOCKED,
                        });

                        nextStep();
                    },
                    async (
                        failedResponse: any //PublicationJobStatus | PostgrestError
                    ) => {
                        setFormState({
                            status: FormStatus.FAILED,
                        });

                        updateContext({
                            disableClose: false,
                        });

                        const incompatibleCollections =
                            failedResponse?.job_status
                                ?.incompatible_collections;

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
            };

            void disableCaptureAndPublish();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    return <DraftErrors draftId={draftId} />;
}

export default DisableCapture;
