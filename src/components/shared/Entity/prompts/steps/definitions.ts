import type { PromptStep } from 'components/shared/Entity/prompts/types';

import DisableCapture from 'components/shared/Entity/prompts/steps/dataFlowReset/DisableCapture';
import EnableCapture from 'components/shared/Entity/prompts/steps/dataFlowReset/EnableCapture';
import PublishStepDataFlowReset from 'components/shared/Entity/prompts/steps/dataFlowReset/Publish';
import SelectMaterialization from 'components/shared/Entity/prompts/steps/dataFlowReset/SelectMaterialization';
import UpdateMaterialization from 'components/shared/Entity/prompts/steps/dataFlowReset/UpdateMaterialization';
import WaitForShardToIdle from 'components/shared/Entity/prompts/steps/dataFlowReset/WaitForShardToIdle';
import Publish from 'components/shared/Entity/prompts/steps/preSave/Publish';
import ReviewSelection from 'components/shared/Entity/prompts/steps/preSave/ReviewSelection';
import { defaultStepState } from 'components/shared/Entity/prompts/store/shared';

export const PreSaveSteps = {
    reviewSelection: {
        StepComponent: ReviewSelection,
        stepLabelMessageId: 'preSavePrompt.reviewSelection.title',
        state: {
            ...defaultStepState,
            valid: true,
        },
    },
    publishStep: {
        StepComponent: Publish,
        stepLabelMessageId: 'preSavePrompt.publish.title',
        state: defaultStepState,
    },
};

export const DataFlowResetSteps: { [key: string]: PromptStep } = {
    selectMaterialization: {
        StepComponent: SelectMaterialization,
        stepLabelMessageId: 'resetDataFlow.selectMaterialization.title',
        state: {
            ...defaultStepState,
            valid: false,
        },
    },
    disableCapture: {
        StepComponent: DisableCapture,
        stepLabelMessageId: 'resetDataFlow.disableCapture.title',
        state: defaultStepState,
    },
    waitForShardToIdle: {
        StepComponent: WaitForShardToIdle,
        stepLabelMessageId: 'resetDataFlow.waitForShardToIdle.title',
        state: {
            ...defaultStepState,
            allowRetry: true,
        },
    },
    updateMaterialization: {
        StepComponent: UpdateMaterialization,
        stepLabelMessageId: 'resetDataFlow.updateMaterialization.title',
        state: {
            ...defaultStepState,
            allowRetry: true,
        },
    },
    enableCapture: {
        StepComponent: EnableCapture,
        stepLabelMessageId: 'resetDataFlow.enableCapture.title',
        state: { ...defaultStepState, allowRetry: true },
    },
    publishStep: {
        StepComponent: PublishStepDataFlowReset,
        stepLabelMessageId: 'resetDataFlow.publish.title',
        state: defaultStepState,
    },
};
