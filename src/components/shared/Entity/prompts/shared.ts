import { CustomEvents } from 'services/types';
import { DEFAULT_FILTER } from 'services/shared';
import type { UpdateMaterializationStepContext } from './steps/dataFlowReset/Publish/types';
import type { DisableCaptureStepContext } from './steps/dataFlowReset/DisableCapture/types';
import type { SelectMaterializationStepContext } from './steps/dataFlowReset/SelectMaterialization/types';
import type { WaitForShardToIdleStepContext } from './steps/dataFlowReset/WaitForShardToIdle/types';
import { DataFlowSteps } from './steps/stepDefinitions';

export interface DataFlowResetContext
    extends DisableCaptureStepContext,
        SelectMaterializationStepContext,
        UpdateMaterializationStepContext,
        WaitForShardToIdleStepContext {
    disableBack: boolean;
    disableClose: boolean;
    dialogMessageId: string;
    loggingEvent: CustomEvents;
}

export const getInitialDataFlowResetContext = (): DataFlowResetContext => ({
    backfillTarget: null,
    captureName: DEFAULT_FILTER,
    captureSpec: null,
    dataFlowResetDraftId: null,
    dataFlowResetPudId: null,
    dialogMessageId: 'preSavePrompt.dialog.title',
    disableBack: false,
    disableClose: false,
    initialPubId: null,
    loggingEvent: CustomEvents.ENTITY_SAVE,
    noMaterializations: null,
    relatedMaterializations: null,
    targetHasOverlap: null,
    timeStopped: null,
});

// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
// `steps` property is run through in order.
export const SAVE_PROMPT_SETTINGS = {
    dataFlowReset: {
        dialogMessageId: 'resetDataFlow.dialog.title',
        loggingEvent: CustomEvents.DATA_FLOW_RESET,
        steps: [
            DataFlowSteps.selectMaterialization,
            DataFlowSteps.reviewSelection,
            DataFlowSteps.disableCapture,
            DataFlowSteps.waitForShardToIdle,
            DataFlowSteps.updateMaterialization,
            DataFlowSteps.enableCapture,
            DataFlowSteps.publishStep,
        ],
    },
    defaultSave: {
        dialogMessageId: 'preSavePrompt.dialog.title',
        loggingEvent: CustomEvents.ENTITY_SAVE,
        steps: [DataFlowSteps.reviewSelection, DataFlowSteps.publishStep],
    },
};
