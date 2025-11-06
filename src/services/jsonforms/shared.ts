import type { ValidationMode } from '@jsonforms/core';

export const ONE_OF_WITH_DESCRIPTIONS = 'oneOfWithDescriptions';
export const CONTAINS_REQUIRED_FIELDS = 'containsRequiredFields';
export const CHILDREN_HAVE_VALUE = 'childrenHaveValue';
export const LAYOUT_PATH = 'layoutPath';
export const SHOW_INFO_SSH_ENDPOINT = 'showInfo_sshEndpoint';
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

export const allowedNullableTypes = [
    'array',
    'integer',
    'number',
    'string',
] as const;
export type AllowedNullables = typeof allowedNullableTypes;
export type AllowedNullable = AllowedNullables[number];
