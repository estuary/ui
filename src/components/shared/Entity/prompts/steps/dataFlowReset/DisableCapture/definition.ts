import type { PromptStep } from 'src/components/shared/Entity/prompts/types';

import DisableCapture from '.';

import { defaultStepState } from 'src/components/shared/Entity/prompts/store/shared';

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
