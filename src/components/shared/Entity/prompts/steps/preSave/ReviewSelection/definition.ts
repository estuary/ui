import { defaultStepState } from '../../../store/shared';
import type { PromptStep } from '../../../types';
import ReviewSelection from '.';

export const ReviewSelectionStep: PromptStep = {
    StepComponent: ReviewSelection,
    stepLabelMessageId: 'preSavePrompt.reviewSelection.title',
    state: {
        ...defaultStepState,
        valid: true,
    },
};
