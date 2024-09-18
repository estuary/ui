import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import SelectMaterialization from '.';

// interface SelectMaterializationStepContext {
//     backfillTarget: LiveSpecsExt_Related | null;
// }

export const SelectMaterializationStep: PromptStep = {
    StepComponent: SelectMaterialization,
    stepLabelMessageId: 'dataFlowReset.selectMaterialization.title',
    state: {
        ...defaultStepState,
        valid: false,
    },
};
