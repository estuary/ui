import { ValidationMode } from '@jsonforms/core';

export const CONTAINS_REQUIRED_FIELDS = 'containsRequiredFields';
export const ADVANCED = 'advanced';

export const defaultOptions = {
    restrict: true,
    showUnfocusedDescription: true,
};

// TODO (json forms) Value being passed in is not used right now... need to decide if it is needed
//   added the hideValidation just to match the style. This should be a single function
export const showValidation = (_val?: any): ValidationMode => {
    return 'ValidateAndShow';
};
export const hideValidation = (_val?: any): ValidationMode => {
    return 'ValidateAndHide';
};
