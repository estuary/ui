import { defaultStepState } from '../../store/shared';
import { PromptStep } from '../../types';
import DisableCapture from './DisableCapture';
import EnableCapture from './EnableCapture';
import SelectMaterialization from './SelectMaterialization';
import MarkMaterialization from './UpdateMaterialization';
import WaitForCaptureStop from './WaitForCaptureStop';

// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
// We run through steps in order
export const DataFlowResetSteps: PromptStep[] = [
    {
        StepComponent: SelectMaterialization,
        stepLabelMessageId: 'dataFlowReset.selectMaterialization.title',
        state: {
            ...defaultStepState,
            valid: false,
        },
    },
    {
        StepComponent: DisableCapture,
        stepLabelMessageId: 'dataFlowReset.disableCapture.title',
        state: defaultStepState,
    },
    {
        StepComponent: WaitForCaptureStop,
        stepLabelMessageId: 'dataFlowReset.waitForCapture.title',
        state: defaultStepState,
    },
    {
        StepComponent: MarkMaterialization,
        stepLabelMessageId: 'dataFlowReset.markMaterialization.title',
        state: defaultStepState,
    },
    {
        StepComponent: EnableCapture,
        stepLabelMessageId: 'dataFlowReset.enableCapture.title',
        state: defaultStepState,
    },
];
