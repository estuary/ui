import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import WaitForCapture from '.';

export const WaitForCaptureStep: PromptStep<null> = {
    StepComponent: WaitForCapture,
    stepLabelMessageId: 'dataFlowReset.waitForCapture.title',
    state: {
        ...defaultStepState,
    },
    context: null,
};
