import { modifyDraftSpec } from 'api/draftSpecs';
import { createPublication, getPublicationByIdQuery } from 'api/publications';
import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useMount } from 'react-use';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { generateDisabledSpec } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function DisableCapture() {
    const draftId = useEditorStore_id();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const { jobStatusPoller } = useJobStatusPoller();

    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [updateStep, updateContext, nextStep] = usePreSavePromptStore(
        (state) => [state.updateStep, state.updateContext, state.nextStep]
    );

    const setFormState = useFormStateStore_setFormState();

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            setFormState({
                status: FormStatus.LOCKED,
                exitWhenLogsClose: true,
            });

            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
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
                    `data flow backfill : ${captureName} : disable : someKeyGoesHere`
                );

                if (updateResponse.error) {
                    updateStep(stepIndex, {
                        error: updateResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                // Start publishing it
                const publishResponse = await createPublication(draftId, false);

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
                    pubId: publishResponse.data[0].id,
                    logsToken: publishResponse.data[0].logs_token,
                });

                jobStatusPoller(
                    getPublicationByIdQuery(publishResponse.data[0].id),
                    async () => {
                        updateStep(stepIndex, {
                            progress: ProgressStates.SUCCESS,
                            valid: true,
                        });

                        nextStep();
                    },
                    async (error: any) => {
                        updateStep(stepIndex, {
                            error,
                            progress: ProgressStates.FAILED,
                            valid: false,
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

    return (
        <>explain what is happening</>
        // <Logs
        //     token={logsToken}
        //     height={350}
        //     loadingLineSeverity="info"
        //     spinnerMessages={{
        //         stoppedKey: 'preSavePrompt.logs.spinner.stopped',
        //         runningKey: 'preSavePrompt.logs.spinner.running',
        //     }}
        // />
    );
}

export default DisableCapture;
