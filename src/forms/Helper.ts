import { ValidationMode } from '@jsonforms/core';
import { materialRenderers } from '@jsonforms/material-renderers';

export const defaultOptions = {
    restrict: true,
    showUnfocusedDescription: true,
};

export const defaultRenderers = [...materialRenderers];

export const showValidation = (val: any): ValidationMode => {
    return val ? 'ValidateAndShow' : 'ValidateAndHide';
};
