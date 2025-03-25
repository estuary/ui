import { defaultStepState } from '../../../store/shared';
import type { PromptStep } from '../../../types';
import PublishStepDataFlowReset from '.';

export interface UpdateMaterializationStepContext {
    dataFlowResetDraftId: string | null;
    dataFlowResetPudId: string | null;
}

export const PublishStep: PromptStep = {
    StepComponent: PublishStepDataFlowReset,
    stepLabelMessageId: 'resetDataFlow.publish.title',
    state: defaultStepState,
};
