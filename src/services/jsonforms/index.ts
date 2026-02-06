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

import type {
    ControlElement,
    GroupLayout,
    JsonSchema,
    LabelElement,
    Layout,
    UISchemaElement,
} from '@jsonforms/core';

import {
    deriveTypes,
    encode,
    Generate,
    isGroup,
    isLayout,
    resolveSchema,
    RuleEffect,
    toDataPath,
    toDataPathSegments,
} from '@jsonforms/core';

import JsonRefs from 'json-refs';
import { concat, includes, isPlainObject, orderBy } from 'lodash';
import isEmpty from 'lodash/isEmpty';

import {
    ADVANCED,
    allowedNullableTypes,
    CONTAINS_REQUIRED_FIELDS,
    LAYOUT_PATH,
    ONE_OF_WITH_DESCRIPTIONS,
    SHOW_INFO_SSH_ENDPOINT,
} from 'src/services/jsonforms/shared';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import {
    Annotations,
    CustomTypes,
    Formats,
    Options,
} from 'src/types/jsonforms';
import { hasOwnProperty } from 'src/utils/misc-utils';
import { ISO_8601_DURATION_PATTERN } from 'src/validation';

// JsonSchema extended with custom connector annotations (multiline, secret, advanced, etc.)
type ExtendedJsonSchema = JsonSchema & Record<string, unknown>;

/////////////////////////////////////////////////////////
//  CUSTOM FUNCTIONS AND SETTINGS
/////////////////////////////////////////////////////////
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

type DateTimeFormats = 'date' | 'date-time' | 'time';
type HandledFormats = 'duration';

const schemaHasFormat = (
    format: DateTimeFormats | HandledFormats,
    schema: JsonSchema
): boolean => {
    if (Object.hasOwn(schema, 'format')) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        return schema['format'] === format;
    } else {
        return false;
    }
};

const schemaHasMultilineProp = (schema: JsonSchema): boolean => {
    if (Object.hasOwn(schema, 'multiline')) {
        return (schema as ExtendedJsonSchema)['multiline'] === true;
    } else {
        return false;
    }
};

const schemaHasSecretProp = (schema: JsonSchema): boolean => {
    if (
        Object.hasOwn(schema, 'secret') ||
        Object.hasOwn(schema, 'airbyte_secret')
    ) {
        const s = schema as ExtendedJsonSchema;
        return s['secret'] === true || s['airbyte_secret'] === true;
    } else {
        return false;
    }
};

const containsSshEndpoint = (schema: JsonSchema): boolean => {
    if (Object.hasOwn(schema, 'properties')) {
        if (Object.hasOwn(schema.properties!, Options.sshEndpoint)) {
            return true;
        }
    }

    return false;
};

const isAdvancedConfig = (schema: JsonSchema): boolean => {
    return (schema as ExtendedJsonSchema)[ADVANCED] === true;
};

const getTypeOtherThanNull = (
    fieldTypes: (string | string[] | undefined)[]
): null | string => {
    if (
        Array.isArray(fieldTypes) &&
        fieldTypes.length === 2 &&
        fieldTypes.includes('null')
    ) {
        const response = fieldTypes.filter((val) => {
            if (!val || Array.isArray(val)) {
                return false;
            }

            // TODO (typing) - for some reason an array of specific strings
            //  cannot have includes pass any string.
            return (allowedNullableTypes as unknown as string[]).includes(val);
        })[0];

        if (typeof response === 'string') {
            return response;
        }
    }

    return null;
};

// This is only supported for anyOf and oneOf. This is manually checked
//  because allOf will also return true for a combinator check. After that we only
//  support when there is exactly two types. This is mainly here to help render
//  pydantic inputs better.
const getNullableType = (schema: JsonSchema): null | string => {
    const combinatorVal = schema.anyOf ?? schema.oneOf ?? null;

    if (combinatorVal === null) {
        return null;
    }

    return getTypeOtherThanNull(combinatorVal.map(({ type }) => type));
};

const allOneOfOptionsContainDescription = (schema: JsonSchema): boolean => {
    return Boolean(
        schema &&
        schema.oneOf &&
        schema.oneOf.length > 0 &&
        (schema.oneOf as JsonSchema[]).every(
            (datum) =>
                hasOwnProperty(datum, 'const') &&
                hasOwnProperty(datum, 'title') &&
                hasOwnProperty(datum, 'description')
        )
    );
};

const isOAuthConfig = (schema: JsonSchema): boolean =>
    Object.hasOwn(schema, Annotations.oAuthProvider);

const isHiddenField = (schema: JsonSchema): boolean =>
    Object.hasOwn(schema, Annotations.hiddenField);

// TODO (reset section) might want to know if there are multiple children in future
// const getChildObjectCount = (schema: JsonSchema) => {
//     if (!schema.properties) {
//         return 0;
//     }
//     return Object.values(schema.properties).map(
//         (property) => property.type === 'object'
//     ).length;
// };

const copyAdvancedOption = (elem: Layout, schema: JsonSchema) => {
    if (isAdvancedConfig(schema)) {
        addOption(elem, ADVANCED, true);
    }
};

export const isRequiredField = (propName: string, rootSchema?: JsonSchema) => {
    const requiredFields = rootSchema?.required;

    return includes(requiredFields, propName);
};

const addRequiredGroupOptions = (
    elem: Layout | ControlElement | GroupLayout
) => {
    if (!Object.hasOwn(elem.options ?? {}, CONTAINS_REQUIRED_FIELDS)) {
        addOption(elem, CONTAINS_REQUIRED_FIELDS, true);
    }
};

const addRenderDescriptionInOptionOptions = (
    elem: Layout | ControlElement | GroupLayout
) => {
    if (!Object.hasOwn(elem.options ?? {}, ONE_OF_WITH_DESCRIPTIONS)) {
        addOption(elem, ONE_OF_WITH_DESCRIPTIONS, true);
        // This is not truly needed but we do force this as an autocomplete
        //  so probably best to make sure JSONForms knows
        addOption(elem, 'autocomplete', true);
    }
};

const addInfoSshEndpoint = (elem: Layout | ControlElement | GroupLayout) => {
    if (!Object.hasOwn(elem.options ?? {}, SHOW_INFO_SSH_ENDPOINT)) {
        addOption(elem, SHOW_INFO_SSH_ENDPOINT, true);
    }
};

const addLayoutPath = (
    elem: Layout | ControlElement | GroupLayout,
    path: string
) => {
    if (!Object.hasOwn(elem.options ?? {}, LAYOUT_PATH)) {
        // Based on `fromScoped` in jsonforms/packages/core/src/util/util.ts
        addOption(elem, LAYOUT_PATH, toDataPathSegments(path).join('.'));
    }
};

const addNullableField = (
    elem: Layout | ControlElement | GroupLayout,
    val: string
) => {
    if (!Object.hasOwn(elem.options ?? {}, Options.nullable)) {
        addOption(elem, Options.nullable, val);
    }
};

const copyRequiredOption = (
    isRequired: boolean,
    elem: Layout | ControlElement | GroupLayout
) => {
    // If we are generating a group then add the required
    //  props if needed so it defaults the group to display
    //  expanded so the user can see the required fields
    if (isRequired) {
        addRequiredGroupOptions(elem);
    }
};

const getOrderedProps = (jsonSchema?: JsonSchema): string[] => {
    if (jsonSchema?.properties) {
        return orderBy(
            Object.keys(jsonSchema.properties),
            (propName: string) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const prop = jsonSchema.properties![propName] as any;

                return prop.order;
            },
            ['asc']
        );
    } else {
        return [];
    }
};

// const generateHorizontalLayout = (elements: any[]) => {
//     return arrayToMatrix(elements, 4).map((controls: any) => ({
//         type: 'HorizontalLayout',
//         elements: controls,
//     }));
// };

interface CategoryUiSchema_Elements {
    type: string;
    label: string;
    options?: any;
    elements: any[];
}

interface CategoryUiSchema {
    type: string;
    elements: CategoryUiSchema_Elements[];
}
export const generateCategoryUiSchema = (uiSchema: any) => {
    const basicElements: CategoryUiSchema_Elements[] = [];
    const advancedElements: CategoryUiSchema_Elements[] = [];

    if (uiSchema?.elements) {
        uiSchema.elements.forEach((element: any) => {
            if (element.label) {
                const groupElements = element.elements
                    ? element.elements
                    : [element];

                advancedElements.push({
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

    const categoryUiSchema: CategoryUiSchema = {
        type: 'VerticalLayout',
        elements: concat(basicElements, advancedElements),
    };

    return categoryUiSchema;
};

/*
Not used right now. May be useful in the future (June 2023)
export const generateDefaultArray = (jsonSchema: JsonSchema) => {
    console.log('generateDefaultArray');
    const defaultValueArray = [];

    if (
        // See if there are items
        jsonSchema.items &&
        // See if it is an object that can contain settings
        isPlainObject(jsonSchema.items) &&
        // Have not seen this in real world just part of the typing
        !Array.isArray(jsonSchema.items)
    ) {
        // Generate the defaults based on the items
        //  Items will be an object with just type when an array of single type
        //  or
        //  Items will be a nested schema when an array of objects
        const defaultValue = createDefaultValue(jsonSchema.items);

        console.log('defaultValue', defaultValue);

        // Put the default value into an array
        defaultValueArray.push(defaultValue);
    }

    return defaultValueArray;
};
*/

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
): UISchemaElement | Layout => {
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
        // We do NOT call startCase as we want to allow
        //  the schema to control case. Ex: "dbt Cloud Job Trigger"
        if (isGroup(layout)) {
            layout.label = labelName;
        } else {
            // add label with name
            const label: LabelElement = {
                type: 'Label',
                text: labelName,
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
            ) as JsonSchema,
            schemaElements,
            currentRef,
            schemaName,
            layoutType,
            rootGenerating,
            rootSchema
        );
    }

    // Fetch all nested props and order them (if they exist)
    const orderedProps = getOrderedProps(jsonSchema);

    // Check if the current schema is one of the required props
    const isRequired = isRequiredField(schemaName, rootSchema);

    if (isPlainObject(jsonSchema)) {
        // We know we never want to show the meta on ResourceConfigs or
        //  any field marked as hidden
        if (schemaName === '_meta' || isHiddenField(jsonSchema)) {
            // This is kind of overkill - but making sure they stay as a control or a group
            //  is the more proper thing to do. Even though they'll be hidden.
            const groupOrControl: GroupLayout | ControlElement = isCombinator(
                jsonSchema
            )
                ? {
                      type: 'Group',
                      elements: [],
                  }
                : createControlElement(currentRef);

            // Add in the rule to always hide. JSONForms currently (Q2 2025) always returns true if the
            //  `type` is one they are not expecting.
            groupOrControl.rule = {
                effect: RuleEffect.HIDE,
                condition: {
                    type: 'fake-to-hopefully-always-return-true',
                },
            };

            return groupOrControl;
        } else if (isCombinator(jsonSchema) && isAdvancedConfig(jsonSchema)) {
            // Always create a Group for "advanced" configuration objects, so that we can collapse it and
            // see the label.

            const group: GroupLayout = {
                type: 'Group',
                elements: [createControlElement(currentRef)],
            };
            copyAdvancedOption(group, jsonSchema);

            copyRequiredOption(isRequired, group);

            return addTitle(group, jsonSchema, schemaName);
        } else if (isCombinator(jsonSchema)) {
            // For oneOf/allOf, we just create a control element. This is where things get weird in json
            // forms, because the _control_ is what causes the tabs to render. Since it's a control and not
            // a layout, it means we lose the ability to have uischemas that apply to the nested elements.

            const controlObject = createControlElement(currentRef);

            if (jsonSchema.title) {
                controlObject.label = jsonSchema.title;
            }

            // Checking if the combinator is a "nullable" field from Pydantic
            //  forms. Needed so we can render them as normal fields and not
            //  actual combinators (tabs).
            const nullableType = getNullableType(jsonSchema);
            if (nullableType) {
                addNullableField(controlObject, nullableType);
            }

            if (allOneOfOptionsContainDescription(jsonSchema)) {
                addRenderDescriptionInOptionOptions(controlObject);
            }

            schemaElements.push(controlObject);

            copyRequiredOption(isRequired, controlObject);

            return controlObject;
        } else if (isOAuthConfig(jsonSchema)) {
            // Handle OAuth specifically as we need to show an "OAuth CTA" to allow
            //  users to sign in with the provider. This includes injecting our own
            //  control in place of the actual properties that would normally be
            //  displayed. Since we are displaying a custom object control
            //  we fetch the "path to fields" so we can properly fire the change event

            const oAuthCTAControl = createControlElement(currentRef);

            addOption(
                oAuthCTAControl,
                Options.oauthProvider,
                (jsonSchema as ExtendedJsonSchema)[Annotations.oAuthProvider]
            );
            addOption(
                oAuthCTAControl,
                Options.oauthFields,
                jsonSchema.required
            );
            addOption(
                oAuthCTAControl,
                Options.oauthPathToFields,
                toDataPath(currentRef)
            );

            if (jsonSchema.title) {
                oAuthCTAControl.label = jsonSchema.title;
            }

            copyRequiredOption(isRequired, oAuthCTAControl);

            schemaElements.push(oAuthCTAControl);
            return oAuthCTAControl;
        }
    }

    const types = deriveTypes(jsonSchema);
    if (types.length === 0) {
        // jsonforms - missing type
        // Usually this happens when there is a type "null" INSIDE of a combinator
        //  the null renderer will not display anything if the currentRef is #
        logRocketEvent(CustomEvents.JSON_FORMS_TYPE_MISSING);
        logRocketConsole(`${CustomTypes.missingType} renderer found`, {
            currentRef,
            jsonSchema,
        });
        return {
            type: CustomTypes.missingType,
            options: {
                ref: currentRef,
            },
        };
    }

    // We're here so it means we are not rendering a combinator and rendering a control
    //  We need to fetch the nullableType. This only fetched the type if the array length
    //  is exactly 2 and we can pull a proper type off one of the values
    const nullableType = getTypeOtherThanNull(types);

    // If we have multiple types and one is not null then go ahead and render a control
    //  that way JSONForms can handle rendering the two types
    if (types.length > 1 && !nullableType) {
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

                copyRequiredOption(isRequired, layout);

                // Checking if the group contains ssh forwarding so we can add a flag
                //  to display an information block in the group
                if (containsSshEndpoint(jsonSchema)) {
                    addInfoSshEndpoint(layout);
                }

                addLayoutPath(layout, currentRef);
            }
        } else {
            layout = createLayout(layoutType);
        }

        // potentially add the advanced option to the layout
        copyAdvancedOption(layout, jsonSchema);

        // Prefer using the schema's title, if provided, but fall back to a generated name if not.
        // The fallback is primarily there because it's more obvious that it's missing than it would
        // be if we just omitted the label altogether.
        const label = jsonSchema.title ? jsonSchema.title : schemaName;
        addLabel(layout, label);

        schemaElements.push(layout);

        if (!isEmpty(jsonSchema.properties)) {
            // traverse properties
            const nextRef: string = `${currentRef}/properties`;

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
                    ) as JsonSchema;
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

    // Now check if the string needs any special handling when rendering the control
    if (nullableType === 'string' || jsonSchema.type === 'string') {
        if (schemaHasSecretProp(jsonSchema)) {
            addOption(controlObject, Options.format, Formats.password);
            if (schemaHasMultilineProp(jsonSchema)) {
                addOption(controlObject, Options.multiLineSecret, true);
            }
        } else if (schemaHasMultilineProp(jsonSchema)) {
            addOption(controlObject, Options.multi, true);
        } else if (schemaHasFormat('date-time', jsonSchema)) {
            addOption(controlObject, Options.format, Formats.dateTime);
        } else if (schemaHasFormat('date', jsonSchema)) {
            addOption(controlObject, Options.format, Formats.date);
        } else if (schemaHasFormat('time', jsonSchema)) {
            addOption(controlObject, Options.format, Formats.time);
        } else if (schemaHasFormat('duration', jsonSchema)) {
            jsonSchema.pattern ??= ISO_8601_DURATION_PATTERN;
        }
    }

    // See if we need to mark the control as nullable. This is separate from the
    //  big block because this could apply to almost anything
    if (
        nullableType &&
        // "Nullable" fields only render with default renderers so we need to know if
        //  the control is a multi line secret so we can skip adding the "nullable" option
        //  and just use our custom renderer
        !Boolean(controlObject.options?.[Options.multiLineSecret])
    ) {
        addNullableField(controlObject, nullableType);
    }

    switch (nullableType ?? types[0]) {
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
    const defaultRootSchema = rootSchema ?? jsonSchema;

    let response;
    response = wrapInLayoutIfNecessary(
        generateUISchema(
            jsonSchema,
            [],
            prefix ?? '#',
            '',
            defaultLayout,
            rootGenerating,
            defaultRootSchema
        ),
        defaultLayout
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (rootGenerating && response) {
        response = generateCategoryUiSchema(response);
    }

    return response;
};

export const getDereffedSchema = async (val: any) => {
    const response = val ? await derefSchema(val) : val;
    return response;
};

export const derefSchema = async (schema: any) => {
    try {
        // Removing for now as oneOf with discriminators will mess up when the
        //  oneOf options use $ref
        // If there is no root ref then skip as handling nested
        //  refs are handled in generateUISchema
        // if (!schema.$ref) {
        //     return schema;
        // }

        const resolveResponse = !schema
            ? null
            : await JsonRefs.resolveRefs(schema, {
                  includeInvalid: true, // Gives us errors in response - does not allow invalid ones through
                  // filter: 'relative', // We do not want to go fetch remote ones just to be safe (2024 Q1)
              });

        // Go through the refs and see if any errored out
        if (
            resolveResponse?.refs &&
            Object.values(resolveResponse.refs).some((ref) => {
                if (Boolean(ref.missing || ref.error)) {
                    logRocketEvent(CustomEvents.JSON_SCHEMA_DEREF, {
                        status: ref.missing ? 'missing' : 'error',
                    });
                    logRocketConsole(CustomEvents.JSON_SCHEMA_DEREF, {
                        missing: ref.missing,
                        error: ref.error,
                    });
                    return true;
                }
                return false;
            })
        ) {
            return null;
        }

        // If the response is null we did not get anything
        // The root ref may have failed but other refs worked
        //  so need to make sure we no longer have the ref in the root
        const response = resolveResponse?.resolved ?? null;
        if (response === null || JsonRefs.isRef(response)) {
            logRocketEvent(CustomEvents.JSON_SCHEMA_DEREF, {
                status: 'empty',
            });
            return null;
        }

        return response;
    } catch (error: unknown) {
        logRocketEvent(CustomEvents.JSON_SCHEMA_DEREF, {
            status: 'error',
        });
        logRocketConsole(CustomEvents.JSON_SCHEMA_DEREF, {
            error,
        });
        return null;
    }
};

Generate.uiSchema = custom_generateDefaultUISchema;
