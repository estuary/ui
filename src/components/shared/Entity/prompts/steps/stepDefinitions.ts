import type { PromptStep } from '../types';
import { defaultStepState } from '../store/shared';
import SelectMaterialization from './dataFlowReset/SelectMaterialization';
import ReviewSelection from './preSave/ReviewSelection';
import DisableCapture from './dataFlowReset/DisableCapture';
import WaitForShardToIdle from './dataFlowReset/WaitForShardToIdle';
import UpdateMaterialization from './dataFlowReset/UpdateMaterialization';
import EnableCapture from './dataFlowReset/EnableCapture';
import PublishStepDataFlowReset from './dataFlowReset/Publish';
import Publish from './preSave/Publish';

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

export const DataFlowSteps: { [key: string]: PromptStep } = {
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
