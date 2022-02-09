import { ValidationMode } from '@jsonforms/core';
import { materialRenderers } from '@jsonforms/material-renderers';
import CaptureSourceControl from './renderers/CaptureSource/CaptureSourceControl';
import captureSourceTester from './renderers/CaptureSource/captureSourceTester';

export const defaultOptions = {
    restrict: true,
    showUnfocusedDescription: true,
};

export const defaultRenderers = [
    ...materialRenderers,
    { tester: captureSourceTester, renderer: CaptureSourceControl },
];

export const showValidation = (val: any): ValidationMode => {
    return val ? 'ValidateAndShow' : 'ValidateAndHide';
};
