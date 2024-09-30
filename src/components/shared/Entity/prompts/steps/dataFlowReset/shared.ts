import { DEFAULT_FILTER } from 'services/supabase';
import {
    PublishStep,
    UpdateMaterializationStepContext,
} from './Publish/definition';
import {
    DisableCaptureStep,
    DisableCaptureStepContext,
} from './DisableCapture/definition';
import { EnableCaptureStep } from './EnableCapture/definition';
import { ReviewSelectionStep } from './ReviewSelection/definition';
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
        WaitForShardToIdleStepContext {}

export const getInitialDataFlowResetContext = (): DataFlowResetContext => ({
    backfillTarget: null,
    captureName: DEFAULT_FILTER,
    captureSpec: null,
    dataFlowResetDraftId: null,
    dataFlowResetPudId: null,
    initialPubId: null,
    liveSpecId: null,
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
