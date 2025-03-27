import type { PromptStep } from 'src/components/shared/Entity/prompts/types';

import UpdateMaterialization from '.';

import { defaultStepState } from 'src/components/shared/Entity/prompts/store/shared';

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
};
