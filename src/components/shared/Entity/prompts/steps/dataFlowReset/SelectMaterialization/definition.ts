import type { LiveSpecsExt_Related } from 'api/liveSpecsExt';
import { defaultStepState } from '../../../store/shared';
import type { PromptStep } from '../../../types';
import SelectMaterialization from '.';

export interface SelectMaterializationStepContext {
    backfillTarget: LiveSpecsExt_Related | null;
    targetHasOverlap: boolean | null;
    noMaterializations: boolean | null;
    relatedMaterializations: LiveSpecsExt_Related[] | null;
}

export const SelectMaterializationStep: PromptStep = {
    StepComponent: SelectMaterialization,
    stepLabelMessageId: 'resetDataFlow.selectMaterialization.title',
    state: {
        ...defaultStepState,
        valid: false,
    },
};
