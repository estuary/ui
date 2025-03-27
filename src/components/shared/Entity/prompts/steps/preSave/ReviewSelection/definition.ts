import type { PromptStep } from 'src/components/shared/Entity/prompts/types';

import ReviewSelection from '.';

import { defaultStepState } from 'src/components/shared/Entity/prompts/store/shared';

export const ReviewSelectionStep: PromptStep = {
    StepComponent: ReviewSelection,
    stepLabelMessageId: 'preSavePrompt.reviewSelection.title',
    state: {
        ...defaultStepState,
        valid: true,
    },
};
