import { defaultStepState } from '../../../store/shared';
import type { PromptStep } from '../../../types';
import Publish from '.';

export const PublishStep: PromptStep = {
    StepComponent: Publish,
    stepLabelMessageId: 'preSavePrompt.publish.title',
    state: defaultStepState,
};
