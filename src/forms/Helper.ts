import { materialRenderers } from '@jsonforms/material-renderers';
import CaptureSourceControl from './renderers/CaptureSource/CaptureSourceControl';
import captureSourceTester from './renderers/CaptureSource/captureSourceTester';

export const getDefaultOptions = () => {
    return {
        restrict: true,
        showUnfocusedDescription: true,
    };
};

export const getRenderers = () => {
    return [
        ...materialRenderers,
        //register custom renderers
        { tester: captureSourceTester, renderer: CaptureSourceControl },
    ];
};
