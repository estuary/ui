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
    CatalogName,
    catalogNameTypeTester,
} from 'forms/renderers/CatalogName';
import {
    CollapsibleGroup,
    collapsibleGroupTester,
} from 'forms/renderers/CollapsibleGroup';
import { ConnectorType, connectorTypeTester } from 'forms/renderers/Connectors';
import { NullType, nullTypeTester } from 'forms/renderers/NullType';
import isEmpty from 'lodash/isEmpty';
//import keys from 'lodash/keys';
import startCase from 'lodash/startCase';

export const defaultOptions = {
    restrict: true,
    showUnfocusedDescription: true,
};

export const defaultRenderers = [
    ...materialRenderers,
    { renderer: NullType, tester: nullTypeTester },
    { renderer: CollapsibleGroup, tester: collapsibleGroupTester },
    { renderer: ConnectorType, tester: connectorTypeTester },
    { renderer: CatalogName, tester: catalogNameTypeTester },
];

export const showValidation = (_val: any): ValidationMode => {
    return 'ValidateAndShow';
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

const addOption = (elem: ControlElement | Layout, key: string, value: any) => {
    if (!elem.options) {
        elem.options = {};
    }
    elem.options[key] = value;
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

const isMultilineText = (schema: JsonSchema): boolean => {
    if (schema.type === 'string' && Object.hasOwn(schema, 'multiline')) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        return schema['multiline'] === true;
    } else {
        return false;
    }
};

const isAdvancedConfig = (schema: JsonSchema): boolean => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    return schema['advanced'] === true;
};

const copyAdvancedOption = (elem: Layout, schema: JsonSchema) => {
    if (isAdvancedConfig(schema)) {
        addOption(elem, 'advanced', true);
    }
};

// eslint-disable-next-line complexity
const generateUISchema = (
    jsonSchema: JsonSchema,
    currentRef: string,
    schemaName: string,
    layoutType: string,
    rootSchema: JsonSchema
): UISchemaElement => {
    if (!isEmpty(jsonSchema) && jsonSchema.$ref !== undefined) {
        return generateUISchema(
            resolveSchema(rootSchema, jsonSchema.$ref),
            currentRef,
            schemaName,
            layoutType,
            rootSchema
        );
    }

    // Always create a Group for "advanced" configuration objects, so that we can collapse it and
    // see the label.
    if (isCombinator(jsonSchema) && isAdvancedConfig(jsonSchema)) {
        const group: GroupLayout = {
            type: 'Group',
            elements: [createControlElement(currentRef)],
        };
        copyAdvancedOption(group, jsonSchema);
        if (jsonSchema.title) {
            group.label = jsonSchema.title;
        } else {
            group.label = schemaName;
        }
        return group;
    }

    // For oneOf/allOf, we just create a control element. This is where things get weird in json
    // forms, because the _control_ is what causes the tabs to render. Since it's a control and not
    // a layout, it means we lose the ability to have uischemas that apply to the nested elements.
    if (isCombinator(jsonSchema)) {
        const controlObject: ControlElement = createControlElement(currentRef);
        if (jsonSchema.title) {
            controlObject.label = jsonSchema.title;
        }
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
            layout = createLayout('Group');
        }
        // Add the advanced option to the layout, if required
        copyAdvancedOption(layout, jsonSchema);

        // Prefer using the schema's title, if provided, but fall back to a generated name if not.
        // The fallback is primarily there because it's more obvious that it's missing than it would
        // be if we just omitted the label altogether.
        const label = jsonSchema.title ? jsonSchema.title : schemaName;
        addLabel(layout, label);

        if (!isEmpty(jsonSchema.properties)) {
            // traverse properties
            const nextRef: string = `${currentRef}/properties`;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            layout.elements = Object.keys(jsonSchema.properties!).map(
                (propName) => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    let value: JsonSchema = jsonSchema.properties![propName];
                    const ref = `${nextRef}/${encode(propName)}`;
                    if (value.$ref !== undefined) {
                        value = resolveSchema(rootSchema, value.$ref);
                    }
                    return generateUISchema(
                        value,
                        ref,
                        propName,
                        layoutType,
                        rootSchema
                    );
                }
            );
        }

        return layout;
    }

    // If we've gotten here, then the schema appears to be for a scalar value. For most of these, we
    // just create a default Control, but for string types, we set the `multi` option based on
    // whether the json schema contains a `multiline` annotation.
    const controlObject: ControlElement = createControlElement(currentRef);
    if (isMultilineText(jsonSchema)) {
        addOption(controlObject, 'multi', true);
    }
    return controlObject;
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
        generateUISchema(jsonSchema, prefix, '', layoutType, rootSchema),
        layoutType
    );

Generate.uiSchema = generateCustomUISchema;
