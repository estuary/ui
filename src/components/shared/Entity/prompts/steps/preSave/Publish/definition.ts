import type { PromptStep } from 'src/components/shared/Entity/prompts/types';

import Publish from '.';

import { defaultStepState } from 'src/components/shared/Entity/prompts/store/shared';

export const PublishStep: PromptStep = {
    StepComponent: Publish,
    stepLabelMessageId: 'preSavePrompt.publish.title',
    state: defaultStepState,
};
