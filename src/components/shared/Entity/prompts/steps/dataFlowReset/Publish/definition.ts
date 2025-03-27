import type { PromptStep } from 'src/components/shared/Entity/prompts/types';

import PublishStepDataFlowReset from '.';

import { defaultStepState } from 'src/components/shared/Entity/prompts/store/shared';

export interface UpdateMaterializationStepContext {
    dataFlowResetDraftId: string | null;
    dataFlowResetPudId: string | null;
}

export const PublishStep: PromptStep = {
    StepComponent: PublishStepDataFlowReset,
    stepLabelMessageId: 'resetDataFlow.publish.title',
    state: defaultStepState,
};
