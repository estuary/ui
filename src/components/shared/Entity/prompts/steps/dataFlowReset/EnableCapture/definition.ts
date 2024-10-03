import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import EnableCapture from '.';

export const EnableCaptureStep: PromptStep = {
    StepComponent: EnableCapture,
    stepLabelMessageId: 'resetDataFlow.enableCapture.title',
    state: { ...defaultStepState, allowRetry: true },
};
