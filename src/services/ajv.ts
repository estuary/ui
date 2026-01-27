import type { DefaultAjvResponse, Schema, SourceCaptureDef } from 'src/types';

import { createAjv } from '@jsonforms/core';

import {
    get_resource_config_pointers,
    update_materialization_resource_spec,
} from '@estuary/flow-web';
import { isEmpty } from 'lodash';

import { Annotations } from 'src/types/jsonforms';
import { stripPathing } from 'src/utils/misc-utils';

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
        Object.entries(resourceSchema.properties).find(([_, value]) =>
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

export function createJSONFormDefaults(jsonSchema: any): DefaultAjvResponse;
export function createJSONFormDefaults(
    jsonSchema: any,
    collection: string,
    dataDefaults: Schema
): DefaultAjvResponse;
export function createJSONFormDefaults(
    jsonSchema: any,
    collection?: string,
    dataDefaults?: Schema
): DefaultAjvResponse {
    // We start with an empty object, and then validate it to set any default values.
    // Note that this requires all parent properties to also specify a `default` in the json
    // schema.
    const data = dataDefaults ?? {};

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

// TODO (web flow wasm - source capture)
// Maybe we can get this type from wasm?
export interface ResourceConfigPointers {
    ['x_collection_name']: string | undefined;
    ['x_schema_name']: string | undefined;
    ['x_delta_updates']: string | undefined;
}

export const prepareSourceCaptureForServer = (arg: SourceCaptureDef) => {
    const response = {
        ...arg,
    };

    // These are optional locally and in the spec.
    //  But when calling WASM we want to make sure they're always there
    if (!response.deltaUpdates) {
        response.deltaUpdates = false;
    }

    // This matches the default provided by flow on the backend
    //  flow/crates/models/src/source_capture.rs
    if (!response.targetNaming) {
        response.targetNaming = 'prefixNonDefaultSchema';
    }

    return response;
};

export const getResourceConfigPointers = (
    schema: any
): ResourceConfigPointers | null => {
    try {
        const response = get_resource_config_pointers(schema);

        if (!response.pointers) {
            return null;
        }

        return response.pointers;
    } catch (e: unknown) {
        return null;
    }
};

export const generateMaterializationResourceSpec = (
    sourceCapture: SourceCaptureDef,
    resourceSpecPointers: ResourceConfigPointers,
    collectionName: string
) => {
    try {
        // TODO (web flow wasm - source capture)
        // We need to do some better error handling here
        const response = update_materialization_resource_spec({
            resourceSpecPointers,
            collectionName,
            resourceSpec: {},
            sourceCapture: prepareSourceCaptureForServer(sourceCapture),
        });

        if (!response) {
            return null;
        }

        return JSON.parse(response);
    } catch (e: unknown) {
        console.error('generateMaterializationResourceSpec failed', e);
        return null;
    }
};
