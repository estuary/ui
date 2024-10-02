import { DEFAULT_FILTER } from 'services/supabase';
import { CustomEvents } from 'services/types';
import { ReviewSelectionStep } from '../preSave/ReviewSelection/definition';
import {
    PublishStep,
    UpdateMaterializationStepContext,
} from './Publish/definition';
import {
    DisableCaptureStep,
    DisableCaptureStepContext,
} from './DisableCapture/definition';
import { EnableCaptureStep } from './EnableCapture/definition';
import {
    SelectMaterializationStep,
    SelectMaterializationStepContext,
} from './SelectMaterialization/definition';
import { UpdateMaterializationStep } from './UpdateMaterialization/definition';
import {
    WaitForShardToIdleStep,
    WaitForShardToIdleStepContext,
} from './WaitForShardToIdle/definition';

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
    liveSpecId: null,
    loggingEvent: CustomEvents.ENTITY_SAVE,
    noMaterializations: null,
    relatedMaterializations: null,
    timeStopped: null,
});

// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
// We run through steps in order
export const DataFlowSteps = {
    selectMaterialization: SelectMaterializationStep,
    reviewSelection: ReviewSelectionStep,
    disableCapture: DisableCaptureStep,
    waitForShardToIdle: WaitForShardToIdleStep,
    updateMaterialization: UpdateMaterializationStep,
    enableCapture: EnableCaptureStep,
    publishStep: PublishStep,
};
export const DataFlowResetSteps = Object.values(DataFlowSteps);
