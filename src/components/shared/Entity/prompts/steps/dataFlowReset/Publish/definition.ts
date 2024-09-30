import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import PublishStepDataFlowReset from '.';

export interface UpdateMaterializationStepContext {
    dataFlowResetDraftId: string | null;
    dataFlowResetPudId: string | null;
}

export const PublishStep: PromptStep = {
    StepComponent: PublishStepDataFlowReset,
    stepLabelMessageId: 'dataFlowReset.publish.title',
    state: defaultStepState,
    // messageIds: defaultStepMessageIds,
};
