import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import ChangeReview from '.';

export const ChangeReviewStep: PromptStep = {
    StepComponent: ChangeReview,
    stepLabelMessageId: 'preSavePrompt.changeReview.title',
    state: {
        ...defaultStepState,
        valid: true,
    },
    // messageIds: defaultStepMessageIds,
};
