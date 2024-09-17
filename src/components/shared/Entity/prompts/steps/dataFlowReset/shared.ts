import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import DisableCapture from './DisableCapture';
import EnableCapture from './EnableCapture';
import SelectMaterialization from './SelectMaterialization';
import MarkMaterialization from './UpdateMaterialization';
import WaitForCaptureStop from './WaitForCaptureStop';

export const DataFlowResetSteps: (() => ReactJSXElement)[] = [
    SelectMaterialization,
    DisableCapture,
    WaitForCaptureStop,
    MarkMaterialization,
    EnableCapture,
];
