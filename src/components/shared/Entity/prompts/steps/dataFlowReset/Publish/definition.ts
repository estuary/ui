import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import PublishStepDataFlowReset from '.';

export const PublishStep: PromptStep = {
    StepComponent: PublishStepDataFlowReset,
    stepLabelMessageId: 'dataFlowReset.reviewSelection.title',
    state: defaultStepState,
};
