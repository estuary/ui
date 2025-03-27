import type { LiveSpecsExt_Related } from 'src/api/liveSpecsExt';
import type { PromptStep } from 'src/components/shared/Entity/prompts/types';

import SelectMaterialization from '.';

import { defaultStepState } from 'src/components/shared/Entity/prompts/store/shared';

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
