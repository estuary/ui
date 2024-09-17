import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import UpdateMaterialization from '.';

export const UpdateMaterializationStep: PromptStep<null> = {
    StepComponent: UpdateMaterialization,
    stepLabelMessageId: 'dataFlowReset.updateMaterialization.title',
    state: {
        ...defaultStepState,
    },
    context: null,
};
