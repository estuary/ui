import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import EnableCapture from '.';

export const EnableCaptureStep: PromptStep<{
    logsToken: string | null;
}> = {
    StepComponent: EnableCapture,
    stepLabelMessageId: 'dataFlowReset.enableCapture.title',
    state: defaultStepState,
    context: {
        logsToken: null,
    },
};
