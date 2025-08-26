import type { AllowedScopes } from 'src/components/editor/MonacoEditor/types';
import type { InferSchemaResponse, Schema } from 'src/types';

import { isEmpty } from 'lodash';

import { hasLength } from 'src/utils/misc-utils';

const typesAllowedAsKeys = ['boolean', 'integer', 'null', 'string'];

const hasWriteSchema = (spec: any) => {
    return spec.hasOwnProperty('writeSchema');
};

const hasReadSchema = (spec: any) => {
    return spec.hasOwnProperty('readSchema');
};

const hasReadAndWriteSchema = (spec: any) => {
    return Boolean(hasReadSchema(spec) && hasReadSchema(spec));
};

const getProperSchemaScope = (spec: any) => {
    const readSchemaExists = hasReadSchema(spec);

    let key: AllowedScopes;
    if (readSchemaExists) {
        key = 'readSchema';
    } else {
        key = 'schema';
    }

    return [key, readSchemaExists];
};

const filterInferSchemaResponse = (schema: InferSchemaResponse | null) => {
    let fields: any | null = null;
    const validKeys: string[] = [];

    if (schema) {
        const { properties } = schema;

        fields = properties
            .filter((inferredProperty: any) => {
                // If there is a blank pointer it cannot be used
                return hasLength(inferredProperty.pointer);
            })
            .map((inferredProperty: any) => {
                const inferredPropertyTypes: string[] = inferredProperty.types;
                const isValidKey = Boolean(
                    // Happens when the schema contradicts itself, which isnt a "feature" we use intentionally
                    inferredProperty.exists !== 'cannot' &&
                        // Make sure we only have a single type besides null
                        inferredPropertyTypes.filter((type) => type !== 'null')
                            .length === 1 &&
                        // make sure all types are valid
                        inferredPropertyTypes.every((type) =>
                            typesAllowedAsKeys.includes(type)
                        )
                );

                if (isValidKey) {
                    validKeys.push(inferredProperty.pointer);
                }

                inferredProperty.allowedToBeKey = isValidKey;
                return inferredProperty;
            });
    }

    return {
        fields,
        validKeys,
    };
};

const moveUpdatedSchemaToReadSchema = (
    original: any,
    updatedSchema: Schema
) => {
    let newSpec = null;

    if (hasWriteSchema(original.spec)) {
        const { ...additionalSpecKeys } = original.spec;

        newSpec = !isEmpty(updatedSchema)
            ? {
                  ...additionalSpecKeys,
                  writeSchema: original.spec.writeSchema,
                  readSchema: updatedSchema,
              }
            : null;
    } else {
        // Removing schema from the object
        const { schema, ...additionalSpecKeys } = original.spec;

        newSpec = !isEmpty(updatedSchema)
            ? {
                  ...additionalSpecKeys,
                  writeSchema: original.spec.schema,
                  readSchema: updatedSchema,
              }
            : null;
    }

    return newSpec;
};

export {
    getProperSchemaScope,
    filterInferSchemaResponse,
    hasReadAndWriteSchema,
    hasReadSchema,
    hasWriteSchema,
    moveUpdatedSchemaToReadSchema,
};
