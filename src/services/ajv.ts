import { createAjv } from '@jsonforms/core';

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
};

export const addKeywords = (ajv: any) => {
    // Flow allows some extra annotations, some of which are used to control how forms are rendered
    // in the UI. The full list of allowed annotations is defined in:
    // https://github.com/estuary/flow/blob/master/crates/doc/src/annotation.rs
    ajv.addKeyword('multiline'); // text input should expect multiple lines
    ajv.addKeyword('secret'); // should render as a password
    ajv.addKeyword('airbyte_secret'); // should render as a password
    ajv.addKeyword('advanced'); // Should be collapsed by default
    ajv.addKeyword('order'); // Unused at this time, but still present in airbyte schemas.
    ajv.addKeyword('x-oauth2-provider'); // Used to display OAuth
    ajv.addKeyword('discriminator'); // User to know what field to key off of with complex oneOfs (ex: parser)
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

export function createJSONFormDefaults(jsonSchema: any): {
    data: any;
    errors: any[];
} {
    // We start with an empty object, and then validate it to set any default values.
    // Note that this requires all parent properties to also specify a `default` in the json
    // schema.
    const data = {};
    const ajvResponse = setJSONFormDefaults(jsonSchema, data);
    const errors =
        ajvResponse.errors && ajvResponse.errors.length > 0
            ? ajvResponse.errors
            : [];
    return { data, errors };
}
