import { PublishStep } from './Publish/definition';
import { DisableCaptureStep } from './DisableCapture/definition';
import { EnableCaptureStep } from './EnableCapture/definition';
import { ReviewSelectionStep } from './ReviewSelection/definition';
import { SelectMaterializationStep } from './SelectMaterialization/definition';
import { UpdateMaterializationStep } from './UpdateMaterialization/definition';
import { WaitForCaptureStep } from './WaitForCaptureStop/definition';

export const DataFlowSteps = {
    selectMaterialization: SelectMaterializationStep,
    reviewSelection: ReviewSelectionStep,
    disableCapture: DisableCaptureStep,
    waitForCapture: WaitForCaptureStep,
    updateMaterialization: UpdateMaterializationStep,
    enableCapture: EnableCaptureStep,
    publishStep: PublishStep,
};

// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
// We run through steps in order
export const DataFlowResetSteps = Object.values(DataFlowSteps);
