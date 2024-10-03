import { createDraftSpec } from 'api/draftSpecs';

import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { generateDisabledSpec } from 'utils/entity-utils';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';

function EnableCapture() {
    const intl = useIntl();
    const stepIndex = useLoopIndex();
    const thisStep = usePreSavePromptStore((state) => state.steps[stepIndex]);

    const [
        updateStep,
        nextStep,
        captureSpec,
        dataFlowResetDraftId,
        captureName,
    ] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.nextStep,
        state.context.captureSpec,
        state.context.dataFlowResetDraftId,
        state.context.captureName,
    ]);

    useEffect(() => {
        if (thisStep.state.progress !== ProgressStates.IDLE) {
            return;
        }

        updateStep(stepIndex, {
            progress: ProgressStates.RUNNING,
        });

        const enableCapture = async () => {
            // Update the Capture to be disabled
            const updateResponse = await createDraftSpec(
                dataFlowResetDraftId,
                captureName,
                generateDisabledSpec(captureSpec, true, false),
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
                optionalLabel: intl.formatMessage({
                    id: 'common.enabled',
                }),
                valid: true,
            });

            nextStep();
        };

        void enableCapture();
    }, [
        captureName,
        captureSpec,
        dataFlowResetDraftId,
        intl,
        nextStep,
        stepIndex,
        thisStep.state.progress,
        updateStep,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
}

export default EnableCapture;
