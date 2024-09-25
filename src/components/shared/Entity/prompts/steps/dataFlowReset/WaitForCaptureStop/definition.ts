import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import WaitForCapture from '.';

// interface WaitForCaptureStepContext {
//     liveSpecId: string | null;
//     timeStopped: string | null;
// }

export const WaitForCaptureStep: PromptStep = {
    StepComponent: WaitForCapture,
    stepLabelMessageId: 'dataFlowReset.waitForCapture.title',
    state: {
        ...defaultStepState,
    },
};
