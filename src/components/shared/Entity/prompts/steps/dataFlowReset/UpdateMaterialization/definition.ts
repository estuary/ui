import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import UpdateMaterialization from '.';

export interface UpdateMaterializationStepContext {
    backfilledDraftId: string | null;
}

export const UpdateMaterializationStep: PromptStep = {
    StepComponent: UpdateMaterialization,
    stepLabelMessageId: 'dataFlowReset.updateMaterialization.title',
    state: {
        ...defaultStepState,
    },
    // messageIds: defaultStepMessageIds,
};
