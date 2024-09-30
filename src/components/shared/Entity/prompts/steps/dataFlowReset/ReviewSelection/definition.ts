import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import ReviewSelection from '.';

export const ReviewSelectionStep: PromptStep = {
    StepComponent: ReviewSelection,
    stepLabelMessageId: 'dataFlowReset.reviewSelection.title',
    state: {
        ...defaultStepState,
        valid: true,
    },
    // messageIds: defaultStepMessageIds,
};
