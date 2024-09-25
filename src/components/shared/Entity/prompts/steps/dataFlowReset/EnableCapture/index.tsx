import { createDraftSpec } from 'api/draftSpecs';

import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useMount } from 'react-use';
import { generateDisabledSpec } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function EnableCapture() {
    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [updateStep, nextStep, context] = usePreSavePromptStore((state) => [
        state.updateStep,
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
                const updateResponse = await createDraftSpec(
                    context.backfilledDraftId,
                    context.captureName,
                    generateDisabledSpec(context.captureSpec, true, false),
                    'capture',
                    undefined,
                    false
                );

                if (updateResponse.error) {
                    updateStep(stepIndex, {
                        error: updateResponse.error,
                        progress: ProgressStates.FAILED,
                    });
                    return;
                }

                updateStep(stepIndex, {
                    progress: ProgressStates.SUCCESS,
                    valid: true,
                });

                nextStep();
            };

            void enableCapture();
        } else {
            console.log('TODO: need to handle showing previous state?');
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

export default EnableCapture;
