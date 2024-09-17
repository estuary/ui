import { DisableCaptureStep } from './DisableCapture/definition';
import { EnableCaptureStep } from './EnableCapture/definition';
import { SelectMaterializationStep } from './SelectMaterialization/definition';
import { UpdateMaterializationStep } from './UpdateMaterialization/definition';
import { WaitForCaptureStep } from './WaitForCaptureStop/definition';

export const DataFlowSteps = {
    selectMaterialization: SelectMaterializationStep,
    disableCapture: DisableCaptureStep,
    waitForCapture: WaitForCaptureStep,
    updateMaterialization: UpdateMaterializationStep,
    enableCapture: EnableCaptureStep,
};

// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
// We run through steps in order
export const DataFlowResetSteps = Object.values(DataFlowSteps);
