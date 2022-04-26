import {
    ControlElement,
    deriveTypes,
    Generate,
    GroupLayout,
    isGroup,
    isLayout,
    JsonSchema,
    LabelElement,
    Layout,
    resolveSchema,
    UISchemaElement,
    ValidationMode,
} from '@jsonforms/core';
import { materialRenderers } from '@jsonforms/material-renderers';
import {
    CollapsibleGroup,
    collapsibleGroupTester,
    CollapsibleGroupType,
} from 'forms/renderers/CollapsibleGroup';
import { NullType, nullTypeTester } from 'forms/renderers/NullType';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import startCase from 'lodash/startCase';

export const defaultOptions = {
    restrict: true,
    showUnfocusedDescription: true,
};

export const defaultRenderers = [
    ...materialRenderers,
    { renderer: NullType, tester: nullTypeTester },
    { renderer: CollapsibleGroup, tester: collapsibleGroupTester },
];

export const showValidation = (val: any): ValidationMode => {
    return val ? 'ValidateAndShow' : 'ValidateAndHide';
};

/**
 * taken from JSON Forms: packages/core/src/util/path.ts
 */
export const encode = (segment: string) =>
    segment.replace(/~/g, '~0').replace(/\//g, '~1');

/**
 * Creates a new ILayout.
 * @param layoutType The type of the laoyut
 * @returns the new ILayout
 */
const createLayout = (layoutType: string): Layout => ({
    elements: [],
    type: layoutType,
});

/**
 * Creates a IControlObject with the given label referencing the given ref
 */
export const createControlElement = (ref: string): ControlElement => ({
    scope: ref,
    type: 'Control',
});

/**
 * Wraps the given {@code uiSchema} in a Layout if there is none already.
 * @param uischema The ui schema to wrap in a layout.
 * @param layoutType The type of the layout to create.
 * @returns the wrapped uiSchema.
 */
const wrapInLayoutIfNecessary = (
    uischema: UISchemaElement,
    layoutType: string
): Layout => {
    if (!isEmpty(uischema) && !isLayout(uischema)) {
        const verticalLayout: Layout = createLayout(layoutType);
        verticalLayout.elements.push(uischema);

        return verticalLayout;
    }

    return uischema as Layout;
};

/**
 * Adds the given {@code labelName} to the {@code layout} if it exists
 * @param layout
 *      The layout which is to receive the label
 * @param labelName
 *      The name of the schema
 */
const addLabel = (layout: Layout, labelName: string) => {
    if (!isEmpty(labelName)) {
        const fixedLabel = startCase(labelName);
        if (isGroup(layout)) {
            layout.label = fixedLabel;
        } else {
            // add label with name
            const label: LabelElement = {
                text: fixedLabel,
                type: 'Label',
            };
            layout.elements.push(label);
        }
    }
};

/**
 * Returns whether the given {@code jsonSchema} is a combinator ({@code oneOf}, {@code anyOf}, {@code allOf}) at the root level
 * @param jsonSchema
 *      the schema to check
 */
const isCombinator = (jsonSchema: JsonSchema): boolean => {
    return (
        !isEmpty(jsonSchema) &&
        (!isEmpty(jsonSchema.oneOf) ||
            !isEmpty(jsonSchema.anyOf) ||
            !isEmpty(jsonSchema.allOf))
    );
};

// eslint-disable-next-line complexity
const generateUISchema = (
    jsonSchema: JsonSchema,
    schemaElements: UISchemaElement[],
    currentRef: string,
    schemaName: string,
    layoutType: string,
    rootSchema: JsonSchema
): UISchemaElement => {
    if (!isEmpty(jsonSchema) && jsonSchema.$ref !== undefined) {
        return generateUISchema(
            resolveSchema(rootSchema, jsonSchema.$ref),
            schemaElements,
            currentRef,
            schemaName,
            layoutType,
            rootSchema
        );
    }

    if (isCombinator(jsonSchema)) {
        const controlObject: ControlElement = createControlElement(currentRef);
        schemaElements.push(controlObject);

        return controlObject;
    }

    const types = deriveTypes(jsonSchema);
    if (types.length === 0) {
        // TODO (jsonforms)
        // This happens when there is a type "null" INSIDE of a combinator
        // need more work but this keeps the form from blowing up at least.
        // @ts-expect-error see above
        return null;
    }

    if (types.length > 1) {
        const controlObject: ControlElement = createControlElement(currentRef);
        schemaElements.push(controlObject);
        return controlObject;
    }

    if (
        (currentRef === '#' && types[0] === 'object') ||
        jsonSchema.properties !== undefined
    ) {
        let layout: Layout | GroupLayout;

        if (currentRef === '#') {
            layout = createLayout(layoutType);
        } else {
            layout = createLayout(CollapsibleGroupType) as GroupLayout;
            addLabel(layout, schemaName);
        }

        schemaElements.push(layout);

        if (jsonSchema.properties && keys(jsonSchema.properties).length > 1) {
            addLabel(layout, schemaName);
        }

        if (!isEmpty(jsonSchema.properties)) {
            // traverse properties
            const nextRef: string = `${currentRef}/properties`;

            // TODO (linting) this is a dumb check since above it was already done
            if (jsonSchema.properties !== undefined) {
                Object.keys(jsonSchema.properties).map((propName) => {
                    // TODO (linting) like above this is safe but TS complained
                    let value;
                    if (jsonSchema.properties) {
                        value = jsonSchema.properties[propName];
                    } else {
                        value = {};
                    }
                    const ref = `${nextRef}/${encode(propName)}`;
                    if (value.$ref !== undefined) {
                        value = resolveSchema(rootSchema, value.$ref);
                    }
                    return generateUISchema(
                        value,
                        layout.elements,
                        ref,
                        propName,
                        layoutType,
                        rootSchema
                    );
                });
            }
        }

        return layout;
    }

    let controlObject: ControlElement;
    switch (types[0]) {
        case 'null':
        case 'object': // object items will be handled by the object control itself
        /* falls through */
        case 'array': // array items will be handled by the array control itself
        /* falls through */
        case 'string':
        /* falls through */
        case 'number':
        /* falls through */
        case 'integer':
        /* falls through */
        case 'boolean':
            controlObject = createControlElement(currentRef);
            schemaElements.push(controlObject);

            return controlObject;
        default:
            throw new Error(`Unknown type: ${JSON.stringify(jsonSchema)}`);
    }
};

/**
 * Generate a custom UI schema.
 * @param {JsonSchema} jsonSchema the JSON schema to generated a UI schema for
 * @param {string} layoutType the desired layout type for the root layout
 *        of the generated UI schema
 */
export const generateCustomUISchema = (
    jsonSchema: JsonSchema,
    layoutType = 'VerticalLayout',
    prefix = '#',
    rootSchema = jsonSchema
): UISchemaElement | Layout =>
    wrapInLayoutIfNecessary(
        generateUISchema(jsonSchema, [], prefix, '', layoutType, rootSchema),
        layoutType
    );

Generate.uiSchema = generateCustomUISchema;
