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
    ajv.addKeyword('multiline'); // text input should expect multiple lines
    ajv.addKeyword('secret'); // should render as a password
    ajv.addKeyword('airbyte_secret'); // should render as a password
    ajv.addKeyword('advanced'); // Should be collapsed by default (over ridden if section contains required fields)
    ajv.addKeyword('order'); // Used to order the fields in the UI
    ajv.addKeyword('x-oauth2-provider'); // Used to display OAuth
    ajv.addKeyword('x-collection-name'); // Used to default name in resource configs
    ajv.addKeyword('discriminator'); // Used to know what field in a complex oneOf should be unique (ex: parser)
    ajv.addKeyword('x-infer-schema'); // Indicates that schema inference should be enabled in the UI
    return ajv;
};

// eslint-disable-next-line func-names
export const setDefaultsValidator = (function () {
    const ajv = createAjv(defaultAjvSettings);
    return addKeywords(ajv);
})();

function setJSONFormDefaults(jsonSchema: any, formData: any) {
    const hydrateAndValidate = setDefaultsValidator.compile(jsonSchema);

    hydrateAndValidate(formData);

    return hydrateAndValidate;
}

function defaultResourceSchema(resourceSchema: any, collection: string) {
    // Find the field with the collection name annotation
    const collectionNameField =
        Object.entries(resourceSchema.properties).find(([_, value]) =>
            value?.hasOwnProperty(Annotations.defaultResourceConfigName)
        ) ?? [];

    // Try to fetch the key
    const collectionNameFieldKey = collectionNameField[0];

    if (collectionNameFieldKey) {
        // Add a default property set to the stripped collection name
        let modifiedSchema = {};

        modifiedSchema = {
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

    const processedSchema =
        collection && !isEmpty(jsonSchema.properties)
            ? defaultResourceSchema(jsonSchema, collection)
            : jsonSchema;

    const ajvResponse = setJSONFormDefaults(processedSchema, data);

    const errors =
        ajvResponse.errors && ajvResponse.errors.length > 0
            ? ajvResponse.errors
            : [];

    return { data, errors };
}
