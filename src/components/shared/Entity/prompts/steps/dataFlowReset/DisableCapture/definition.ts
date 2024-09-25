import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import DisableCapture from '.';

// interface DisableCaptureStepContext {
//     pubId: string | null;
//     captureSpec: JSON | null;
//     captureName: string | null;
// }
export const DisableCaptureStep: PromptStep = {
    StepComponent: DisableCapture,
    stepLabelMessageId: 'dataFlowReset.disableCapture.title',
    state: defaultStepState,
};
