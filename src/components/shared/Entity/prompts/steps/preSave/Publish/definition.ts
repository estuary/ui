import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import Publish from '.';

export const PublishStep: PromptStep<null> = {
    StepComponent: Publish,
    stepLabelMessageId: 'preSavePrompt.publish.title',
    state: defaultStepState,
    context: null,
};
