import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import DisableCapture from '.';

export interface DisableCaptureStepContext {
    captureName: string;
    captureSpec: JSON | null;
    initialPubId: string | null;
}
export const DisableCaptureStep: PromptStep = {
    StepComponent: DisableCapture,
    stepLabelMessageId: 'resetDataFlow.disableCapture.title',
    state: defaultStepState,
};
