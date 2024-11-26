import { createAjv } from '@jsonforms/core';
import { isEmpty } from 'lodash';
import { Annotations } from 'types/jsonforms';
import { stripPathing } from 'utils/misc-utils';

type Ajv = ReturnType<typeof createAjv>;

// TODO (typing) Need to get this typed as the AJV Options type
export const defaultAjvSettings: any = {
    // Causes it to mutate its input to set default values.
    useDefaults: 'empty',
    // Don't barf when things aren't quite aligned with the JSON schema spec. Log it instead.
    strict: 'log',
    // Skip validation of the schema itself, because many connector schemas won't validate.
    // Normally, we'd want to just fix the schemas, but this allows the validator to deal with
    // draft-4 schemas, which normally requires using a separate legacy validator.
    validateSchema: false,
    // Disable validations based on `format` keywords in the schema. Ideally, we'd re-enable this at
    // some point, but there's a few problems with it. One is that many schemas seem to mis-use the
    // `date-time` format to mean ISO8601 instead of RFC3339. Another is that some schemas seem to
    // use made-up format strings that we won't recognize.
    validateFormats: false,
    // This requires that all schemas are unique in ID and you cannot call AJV multiple
    // times with a schema with the same ID. This is good to turn back on eventually because
    // compiling AJV multiple times makes no sense but this is easiest currently.
    addUsedSchema: false,
};

export const addKeywords = (ajv: Ajv) => {
    // Flow allows some extra annotations, some of which are used to control how forms are rendered
    // in the UI. The full list of allowed annotations is defined in:
    // https://github.com/estuary/flow/blob/master/crates/doc/src/annotation.rs

    // How to write a config schema
    // https://github.com/estuary/connectors/blob/main/config_schema_guidelines.md
    for (const annotation of Object.values(Annotations)) {
        if (typeof annotation === 'string') {
            ajv.addKeyword(annotation);
        }
    }

    return ajv;
};

export const customAjv = addKeywords(createAjv(defaultAjvSettings));

function setJSONFormDefaults(jsonSchema: any, formData: any) {
    const hydrateAndValidate = customAjv.compile(jsonSchema);

    hydrateAndValidate(formData);

    return hydrateAndValidate;
}

function defaultResourceSchema(resourceSchema: any, collection: string) {
    // Find the field with the collection name annotation
    const collectionNameField =
        Object.entries(resourceSchema.properties).find(
            ([_, value]) =>
                value?.hasOwnProperty(Annotations.defaultResourceConfigName)
        ) ?? [];

    // Try to fetch the key
    const collectionNameFieldKey = collectionNameField[0];

    if (collectionNameFieldKey) {
        // Add a default property set to the stripped collection name
        const modifiedSchema = {
            ...resourceSchema,
            properties: {
                ...resourceSchema.properties,
                [collectionNameFieldKey]: {
                    ...resourceSchema.properties[collectionNameFieldKey],
                    default: stripPathing(collection),
                },
            },
        };

        return modifiedSchema;
    } else {
        return resourceSchema;
    }
}

export function createJSONFormDefaults(
    jsonSchema: any,
    collection?: string
): {
    data: any;
    errors: any[];
} {
    // We start with an empty object, and then validate it to set any default values.
    // Note that this requires all parent properties to also specify a `default` in the json
    // schema.
    const data = {};

    // Get the schema we want.
    //  If collection then we want to generate a Resource Schema
    //  Stick with schema passed in otherwise as it should be an Endpoint Schema
    const processedSchema =
        collection && !isEmpty(jsonSchema.properties)
            ? defaultResourceSchema(jsonSchema, collection)
            : jsonSchema;

    // Get the default values
    const ajvResponse = setJSONFormDefaults(processedSchema, data);

    // See if there are any errors
    const errors =
        ajvResponse.errors && ajvResponse.errors.length > 0
            ? ajvResponse.errors
            : [];

    return { data, errors };
}

export interface ResourceConfigPointers {
    [Annotations.defaultResourceConfigName]?: boolean;
    [Annotations.targetSchema]?: boolean;
    [Annotations.deltaUpdates]?: boolean;
}

export const findKeysInObject = (
    obj: Record<string, any>,
    keysToFind: string[],
    results: ResourceConfigPointers = {}
): ResourceConfigPointers => {
    // Iterate over each key in the object
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];

            // Check if the key is one of the keys we're searching for
            if (keysToFind.includes(key)) {
                results[key] = value;
            }

            // If the value is an object, recurse into it
            if (value && typeof value === 'object') {
                findKeysInObject(value, keysToFind, results);
            }
        }
    }

    return results;
};

export const getResourceConfigPointers = (schema: any) =>
    findKeysInObject(schema, [
        Annotations.defaultResourceConfigName,
        Annotations.targetSchema,
        Annotations.deltaUpdates,
    ]);
