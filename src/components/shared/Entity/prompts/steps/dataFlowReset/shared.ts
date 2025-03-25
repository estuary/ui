import { DEFAULT_FILTER } from 'services/supabase';
import { CustomEvents } from 'services/types';
import { ReviewSelectionStep } from '../preSave/ReviewSelection/definition';
import type { UpdateMaterializationStepContext } from './Publish/definition';
import { PublishStep } from './Publish/definition';
import type { DisableCaptureStepContext } from './DisableCapture/definition';
import { DisableCaptureStep } from './DisableCapture/definition';
import { EnableCaptureStep } from './EnableCapture/definition';
import type { SelectMaterializationStepContext } from './SelectMaterialization/definition';
import { SelectMaterializationStep } from './SelectMaterialization/definition';
import { UpdateMaterializationStep } from './UpdateMaterialization/definition';
import type { WaitForShardToIdleStepContext } from './WaitForShardToIdle/definition';
import { WaitForShardToIdleStep } from './WaitForShardToIdle/definition';

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

export const DataFlowSteps = {
    selectMaterialization: SelectMaterializationStep,
    reviewSelection: ReviewSelectionStep,
    disableCapture: DisableCaptureStep,
    waitForShardToIdle: WaitForShardToIdleStep,
    updateMaterialization: UpdateMaterializationStep,
    enableCapture: EnableCaptureStep,
    publishStep: PublishStep,
};

// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
// We run through steps in order so hardcoding this to ensure 100% the order is right
export const DataFlowResetSteps = [
    DataFlowSteps.selectMaterialization,
    DataFlowSteps.reviewSelection,
    DataFlowSteps.disableCapture,
    DataFlowSteps.waitForShardToIdle,
    DataFlowSteps.updateMaterialization,
    DataFlowSteps.enableCapture,
    DataFlowSteps.publishStep,
];

export const DefaultSteps = [
    DataFlowSteps.reviewSelection,
    DataFlowSteps.publishStep,
];
