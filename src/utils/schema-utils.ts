import type { AllowedScopes } from 'src/components/editor/MonacoEditor/types';
import type { Schema, SkimProjectionResponse } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';

import { isEmpty } from 'lodash';

// These are inserted by the server and never would make sense as keys
const invalidKeyPointers = ['/_meta/uuid', '/_meta/flow_truncated'];
const canPointerBeUsedAsKey = (pointer: string | null | undefined) => {
    return (
        pointer &&
        pointer.length > 0 &&
        !invalidKeyPointers.includes(pointer.toLowerCase())
    );
};
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

const isValidKey = (inference: any, pointer?: any) => {
    if (!inference) {
        return false;
    }

    const inferredTypes: string[] = inference.types;

    return Boolean(
        // Happens when the schema contradicts itself, which isnt a "feature" we use intentionally
        inference.exists !== 'CANNOT' &&
            // Make sure we only have a single type besides null
            inferredTypes.filter((type) => type !== 'null').length === 1 &&
            // make sure all types are valid
            inferredTypes.every((type) => typesAllowedAsKeys.includes(type)) &&
            // make sure the pointer is allowed since server inserts on fields
            (pointer ? canPointerBeUsedAsKey(pointer) : true)
    );
};

export const isValidCollectionKey = (inference: any | undefined): boolean => {
    return isValidKey(inference);
};

const filterSkimProjectionResponse = (
    schema: SkimProjectionResponse | null
) => {
    const validKeys: string[] = [];
    let fields: BuiltProjection[] | null = null;

    if (schema) {
        const { projections } = schema;

        fields = projections
            .filter(
                (inferredProperty) =>
                    inferredProperty &&
                    inferredProperty.ptr &&
                    inferredProperty.ptr.length > 0
            )
            .map((inferredProperty) => {
                if (
                    // Ensure the key is allowed and can be valid
                    isValidKey(
                        inferredProperty.inference,
                        inferredProperty.ptr
                    ) &&
                    // Make sure we have a pointer and it is not duplicated (projections)
                    inferredProperty.ptr &&
                    !validKeys.includes(inferredProperty.ptr)
                ) {
                    validKeys.push(inferredProperty.ptr);
                }

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

// Reduce down to get rid of duplicate pointers. We do this mainly so
//  projections do not show the same pointer multiple times. We _could_ filter
//  on the explicit property however there are times where certain projections (patterns)
//  would be a valid reason to use a projection as part of the key
const reduceBuiltProjections = (
    acc: any[],
    inferredProperty: BuiltProjection
) => {
    const existingIndex = acc.findIndex(
        (item) => item.ptr === inferredProperty.ptr
    );

    if (existingIndex === -1) {
        acc.push(inferredProperty);
    }

    return acc;
};

export {
    getProperSchemaScope,
    filterSkimProjectionResponse,
    hasReadAndWriteSchema,
    hasReadSchema,
    hasWriteSchema,
    moveUpdatedSchemaToReadSchema,
    reduceBuiltProjections,
};
