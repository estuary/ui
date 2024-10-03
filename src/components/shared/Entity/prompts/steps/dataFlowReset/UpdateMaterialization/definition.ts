import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import UpdateMaterialization from '.';

export interface UpdateMaterializationStepContext {
    backfilledDraftId: string | null;
}

export const UpdateMaterializationStep: PromptStep = {
    StepComponent: UpdateMaterialization,
    stepLabelMessageId: 'resetDataFlow.updateMaterialization.title',
    state: {
        ...defaultStepState,
        allowRetry: true,
    },
    // messageIds: defaultStepMessageIds,
};
