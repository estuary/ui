import type { PromptStep } from 'src/components/shared/Entity/prompts/types';

import EnableCapture from '.';

import { defaultStepState } from 'src/components/shared/Entity/prompts/store/shared';

export const EnableCaptureStep: PromptStep = {
    StepComponent: EnableCapture,
    stepLabelMessageId: 'resetDataFlow.enableCapture.title',
    state: { ...defaultStepState, allowRetry: true },
};
