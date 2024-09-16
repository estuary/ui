import { defaultStepState } from '../../store/shared';
import { PromptStep } from '../../types';
import DisableCapture from './DisableCapture';
import EnableCapture from './EnableCapture';
import SelectMaterialization from './SelectMaterialization';
import MarkMaterialization from './UpdateMaterialization';
import WaitForCaptureStop from './WaitForCaptureStop';

export const DataFlowResetSteps: PromptStep[] = [
    {
        StepComponent: SelectMaterialization,
        state: {
            ...defaultStepState,
            valid: false,
        },
    },
    {
        StepComponent: DisableCapture,
        state: defaultStepState,
    },
    {
        StepComponent: WaitForCaptureStop,
        state: defaultStepState,
    },
    {
        StepComponent: MarkMaterialization,
        state: defaultStepState,
    },
    {
        StepComponent: EnableCapture,
        state: defaultStepState,
    },
];
