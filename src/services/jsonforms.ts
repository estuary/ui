/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/

import {
    ControlElement,
    deriveTypes,
    encode,
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
import {
    MultiLineSecret,
    multiLineSecretTester,
} from 'forms/renderers/MultiLineSecret';
import { NullType, nullTypeTester } from 'forms/renderers/NullType';
import { oAuthProviderTester, OAuthType } from 'forms/renderers/OAuth';
import MaterialOneOfRenderer_Discriminator, {
    materialOneOfControlTester_Discriminator,
} from 'forms/renderers/Overrides/material/complex/MaterialOneOfRenderer_Discriminator';
import { orderBy } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import startCase from 'lodash/startCase';
import { Annotations, Formats, Options, Patterns } from 'types/jsonforms';

/////////////////////////////////////////////////////////
//  CUSTOM FUNCTIONS AND SETTINGS
/////////////////////////////////////////////////////////
export const defaultOptions = {
    restrict: true,
    showUnfocusedDescription: true,
};

export const defaultRenderers = [
    ...materialRenderers,
    // These are basically the same as JSONForm's but with tweaks to default functionality
    {
        renderer: MaterialOneOfRenderer_Discriminator,
        tester: materialOneOfControlTester_Discriminator,
    },

    // Custom layouts
    { renderer: OAuthType, tester: oAuthProviderTester },
    { renderer: CollapsibleGroup, tester: collapsibleGroupTester },

    // Custom controls
    { renderer: NullType, tester: nullTypeTester },
    { renderer: ConnectorType, tester: connectorTypeTester },
    { renderer: CatalogName, tester: catalogNameTypeTester },
    { renderer: MultiLineSecret, tester: multiLineSecretTester },
];

// TODO (json forms) Value being passed in is not used right now... need to decide if it is needed
//   added the hideValidation just to match the style. This should be a single function
export const showValidation = (_val?: any): ValidationMode => {
    return 'ValidateAndShow';
};
export const hideValidation = (_val?: any): ValidationMode => {
    return 'ValidateAndHide';
};

const addOption = (elem: ControlElement | Layout, key: string, value: any) => {
    if (!elem.options) {
        elem.options = {};
    }
    elem.options[key] = value;

    return elem;
};

const addTitle = (
    group: GroupLayout,
    jsonSchema: JsonSchema,
    schemaName: string
) => {
    if (jsonSchema.title) {
        group.label = jsonSchema.title;
    } else {
        group.label = schemaName;
    }

    return group;
};

const isMultilineText = (schema: JsonSchema): boolean => {
    if (schema.type === 'string' && Object.hasOwn(schema, 'multiline')) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        return schema['multiline'] === true;
    } else {
        return false;
    }
};

const isDateTimeText = (schema: JsonSchema): boolean => {
    if (schema.type === 'string' && Object.hasOwn(schema, 'format')) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        return schema['format'] === 'date-time';
    } else {
        return false;
    }
};

const isSecretText = (schema: JsonSchema): boolean => {
    if (
        schema.type === 'string' &&
        (Object.hasOwn(schema, 'secret') ||
            Object.hasOwn(schema, 'airbyte_secret'))
    ) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        return schema['secret'] === true || schema['airbyte_secret'] === true;
    } else {
        return false;
    }
};

const isAdvancedConfig = (schema: JsonSchema): boolean => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    return schema['advanced'] === true;
};

const isOAuthConfig = (schema: JsonSchema): boolean => {
    return Object.hasOwn(schema, Annotations.oAuthProvider);
};

const copyAdvancedOption = (elem: Layout, schema: JsonSchema) => {
    if (isAdvancedConfig(schema)) {
        addOption(elem, 'advanced', true);
    }
};

// const generateHorizontalLayout = (elements: any[]) => {
//     return arrayToMatrix(elements, 4).map((controls: any) => ({
//         type: 'HorizontalLayout',
//         elements: controls,
//     }));
// };

interface CategoryUiSchema {
    type: string;
    elements: [
        {
            type: string;
            label: string;
            options?: any;
            elements: any[];
        }
    ];
}
export const generateCategoryUiSchema = (uiSchema: any) => {
    const basicElements: any[] = [];
    const categoryUiSchema: CategoryUiSchema = {
        type: 'VerticalLayout',
        elements: [
            {
                type: 'Group',
                label: 'Basic Config',
                elements: [],
            },
        ],
    };

    if (uiSchema?.elements) {
        uiSchema.elements.forEach((element: any) => {
            if (element.label) {
                const groupElements = element.elements
                    ? element.elements
                    : [element];

                categoryUiSchema.elements.push({
                    type: 'Group',
                    label: element.label,
                    options: {
                        ...(element.options ?? {}),
                        advanced: true,
                    },
                    elements: [
                        {
                            type: 'VerticalLayout',
                            elements: groupElements,
                        },
                    ],
                });
            } else {
                basicElements.push(element);
            }
        });
    }

    if (basicElements.length > 0) {
        categoryUiSchema.elements[0].elements = basicElements;
    } else {
        categoryUiSchema.elements.shift();
    }

    return categoryUiSchema;
};

/////////////////////////////////////////////////////////
//  CUSTOM FUNCTIONS AND SETTINGS
/////////////////////////////////////////////////////////

/**
 * Creates a new ILayout.
 * @param layoutType The type of the laoyut
 * @returns the new ILayout
 */
const createLayout = (layoutType: string): Layout => ({
    type: layoutType,
    elements: [],
});

/**
 * Creates a IControlObject with the given label referencing the given ref
 */
export const createControlElement = (ref: string): ControlElement => ({
    type: 'Control',
    scope: ref,
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

    return uischema;
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
                type: 'Label',
                text: fixedLabel,
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
    rootGenerating: boolean,
    rootSchema?: JsonSchema
): UISchemaElement => {
    if (!isEmpty(jsonSchema) && jsonSchema.$ref !== undefined) {
        return generateUISchema(
            resolveSchema(
                rootSchema as JsonSchema,
                jsonSchema.$ref,
                rootSchema as JsonSchema
            ),
            schemaElements,
            currentRef,
            schemaName,
            layoutType,
            rootGenerating,
            rootSchema
        );
    }

    if (isCombinator(jsonSchema) && isAdvancedConfig(jsonSchema)) {
        // Always create a Group for "advanced" configuration objects, so that we can collapse it and
        // see the label.

        const group: GroupLayout = {
            type: 'Group',
            elements: [createControlElement(currentRef)],
        };
        copyAdvancedOption(group, jsonSchema);
        return addTitle(group, jsonSchema, schemaName);
    } else if (isCombinator(jsonSchema)) {
        // For oneOf/allOf, we just create a control element. This is where things get weird in json
        // forms, because the _control_ is what causes the tabs to render. Since it's a control and not
        // a layout, it means we lose the ability to have uischemas that apply to the nested elements.

        const controlObject = createControlElement(currentRef);

        if (jsonSchema.title) {
            controlObject.label = jsonSchema.title;
        }

        schemaElements.push(controlObject);

        return controlObject;
    } else if (isOAuthConfig(jsonSchema)) {
        // Handle OAuth specifically as we need to show an "OAuth CTA" to allow
        //  users to sign in with the provider. This includes injecting our own
        //  control in place of the actual properties that would normally be
        //  displayed.

        const oAuthCTAControl = createControlElement(currentRef);
        addOption(
            oAuthCTAControl,
            Options.oauthProvider,
            jsonSchema[Annotations.oAuthProvider]
        );
        addOption(oAuthCTAControl, Options.oauthFields, jsonSchema.required);

        if (jsonSchema.title) {
            oAuthCTAControl.label = jsonSchema.title;
        }

        schemaElements.push(oAuthCTAControl);

        return oAuthCTAControl;
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

        if (rootGenerating) {
            if (currentRef === '#') {
                layout = createLayout(layoutType);
            } else {
                layout = createLayout('Group');
            }
        } else {
            layout = createLayout(layoutType);
        }

        // Add the advanced option to the layout, if required
        copyAdvancedOption(layout, jsonSchema);

        // Prefer using the schema's title, if provided, but fall back to a generated name if not.
        // The fallback is primarily there because it's more obvious that it's missing than it would
        // be if we just omitted the label altogether.
        const label = jsonSchema.title ? jsonSchema.title : schemaName;
        addLabel(layout, label);

        schemaElements.push(layout);

        if (jsonSchema.properties && keys(jsonSchema.properties).length > 1) {
            addLabel(layout, schemaName);
        }

        if (!isEmpty(jsonSchema.properties)) {
            // traverse properties
            const nextRef: string = `${currentRef}/properties`;

            // Order the properties based on the schema
            const orderedProps = orderBy(
                Object.keys(jsonSchema.properties),
                (propName: string) => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const prop = jsonSchema.properties![propName] as any;

                    return prop.order;
                },
                ['asc']
            );

            // Step through the ordered properties
            layout.elements = orderedProps.map((propName) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                let value: JsonSchema = jsonSchema.properties![propName];
                const ref = `${nextRef}/${encode(propName)}`;
                if (value.$ref !== undefined) {
                    value = resolveSchema(
                        rootSchema as JsonSchema,
                        value.$ref,
                        rootSchema as JsonSchema
                    );
                }

                return generateUISchema(
                    value,
                    layout.elements,
                    ref,
                    propName,
                    layoutType,
                    rootGenerating,
                    rootSchema
                );
            });
        }

        return layout;
    }

    // If we've gotten here, then the schema appears to be for a scalar value. For most of these, we
    // just create a default Control. We want to check for date first to make sure that renders correctly.
    // Then we check if it is password. If it is we set the proper format. While inside that we check for
    // multi line and set the format option so the MutliLineSecret renderer will pick it up.
    // After that we check if it is just multiline.

    const controlObject: ControlElement = createControlElement(currentRef);
    if (isDateTimeText(jsonSchema)) {
        const newControl = addOption(
            controlObject,
            Options.format,
            Formats.dateTime
        );
        if (newControl.options) {
            newControl.options.dateTimeFormat = Patterns.dateTime;
            newControl.options.dateTimeSaveFormat = Patterns.dateTime;
        }
    } else if (isSecretText(jsonSchema)) {
        addOption(controlObject, Options.format, Formats.password);
        if (isMultilineText(jsonSchema)) {
            addOption(controlObject, Options.multiLineSecret, true);
        }
    } else if (isMultilineText(jsonSchema)) {
        addOption(controlObject, Options.multi, true);
    }

    switch (types[0]) {
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
        /* falls through */
        default:
            schemaElements.push(controlObject);
            return controlObject;
    }
};

/**
 * Generate a default UI schema.
 * @param {JsonSchema} jsonSchema the JSON schema to generated a UI schema for
 * @param {string} layoutType the desired layout type for the root layout
 *        of the generated UI schema
 */
export const custom_generateDefaultUISchema = (
    jsonSchema: JsonSchema,
    layoutType?: string,
    prefix?: string,
    rootSchema?: JsonSchema
): UISchemaElement => {
    const rootGenerating = !layoutType && !prefix && !rootSchema;
    const defaultLayout = layoutType ?? 'VerticalLayout';

    let response;
    response = wrapInLayoutIfNecessary(
        generateUISchema(
            jsonSchema,
            [],
            prefix ?? '#',
            '',
            defaultLayout,
            rootGenerating,
            rootSchema ?? jsonSchema
        ),
        defaultLayout
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (rootGenerating && response) {
        response = generateCategoryUiSchema(response);
    }

    return response;
};

Generate.uiSchema = custom_generateDefaultUISchema;
