import type { DisableCaptureStepContext } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/DisableCapture/definition';
import type { UpdateMaterializationStepContext } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/Publish/definition';
import type { SelectMaterializationStepContext } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/SelectMaterialization/definition';
import type { WaitForShardToIdleStepContext } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/WaitForShardToIdle/definition';

import { DisableCaptureStep } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/DisableCapture/definition';
import { EnableCaptureStep } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/EnableCapture/definition';
import { PublishStep } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/Publish/definition';
import { SelectMaterializationStep } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/SelectMaterialization/definition';
import { UpdateMaterializationStep } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/UpdateMaterialization/definition';
import { WaitForShardToIdleStep } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/WaitForShardToIdle/definition';
import { ReviewSelectionStep } from 'src/components/shared/Entity/prompts/steps/preSave/ReviewSelection/definition';
import { DEFAULT_FILTER } from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';

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
