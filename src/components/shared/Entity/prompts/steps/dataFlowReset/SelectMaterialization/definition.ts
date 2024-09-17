import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import SelectMaterialization from '.';

export const SelectMaterializationStep: PromptStep<{
    backfillTarget: string | null;
}> = {
    StepComponent: SelectMaterialization,
    stepLabelMessageId: 'dataFlowReset.selectMaterialization.title',
    state: {
        ...defaultStepState,
        valid: false,
    },
    context: {
        backfillTarget: null,
    },
};
