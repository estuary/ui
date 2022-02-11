import { Layout, UISchemaElement, ValidationMode } from '@jsonforms/core';
import { materialRenderers } from '@jsonforms/material-renderers';
import {
    CollapsibleGroup,
    collapsibleGroupTester,
} from './renderers/CollapsibleGroup';
import { NullType, nullTypeTester } from './renderers/NullType';
import { generateCustomUISchema } from './uischema';

export const defaultOptions = {
    restrict: true,
    showUnfocusedDescription: true,
};

export const defaultRenderers = [
    ...materialRenderers,
    { tester: nullTypeTester, renderer: NullType },
    { tester: collapsibleGroupTester, renderer: CollapsibleGroup },
];

export const showValidation = (val: any): ValidationMode => {
    return val ? 'ValidateAndShow' : 'ValidateAndHide';
};

export const generateUISchema = (jsonschema: any): UISchemaElement => {
    return generateCustomUISchema(jsonschema, 'VerticalLayout') as Layout;
};
