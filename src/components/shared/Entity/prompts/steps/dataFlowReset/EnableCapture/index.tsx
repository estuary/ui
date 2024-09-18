import { modifyDraftSpec } from 'api/draftSpecs';

import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
import { generateDisabledSpec } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function EnableCapture() {
    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [updateStep, updateContext, nextStep, context] =
        usePreSavePromptStore((state) => [
            state.updateStep,
            state.updateContext,
            state.nextStep,
            state.context,
        ]);

    useMount(() => {
        if (thisStep.state.progress === ProgressStates.IDLE) {
            updateStep(stepIndex, {
                progress: ProgressStates.RUNNING,
            });

            const enableCapture = async () => {
                // Update the Capture to be disabled
                const updateResponse = await modifyDraftSpec(
                    generateDisabledSpec(context.captureSpec, true, false),
                    {
                        draft_id: context.backfilledDraftId,
                        catalog_name: context.captureName,
                        spec_type: 'capture',
                    },
                    undefined,
                    undefined,
                    `data flow backfill : ${context.captureName} : enable : someKeyGoesHere`
                );

                if (updateResponse.error) {
                    updateStep(stepIndex, {
                        error: updateResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                console.log('hey we are ready to publish', updateContext);

                updateStep(stepIndex, {
                    progress: ProgressStates.SUCCESS,
                });
                nextStep();

                // // Start publishing it
                // This needs to be the next step
            };

            void enableCapture();
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

export default EnableCapture;
