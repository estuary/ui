import type { AllowedScopes } from 'src/components/editor/MonacoEditor/types';
import type { InferSchemaResponse, Schema } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';

import { isEmpty } from 'lodash';

// These are inserted by the server and never would make sense as keys
const invalidKeyPointers = ['/_meta/uuid', '/_meta/flow_truncated'];

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

const canPointerBeUsedAsKey = (pointer: string | null | undefined) => {
    return (
        pointer &&
        pointer.length > 0 &&
        !invalidKeyPointers.includes(pointer.toLowerCase())
    );
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
    const validKeys: string[] = [];
    let fields: BuiltProjection[] | null = null;

    if (schema) {
        const { projections } = schema;

        fields = projections
            .filter((inferredProperty) => {
                return (
                    inferredProperty &&
                    inferredProperty.ptr &&
                    inferredProperty.ptr.length > 0
                );
            })
            .map((inferredProperty) => {
                const inferredPropertyTypes: string[] =
                    inferredProperty.inference.types;

                const isValidKey = Boolean(
                    // Happens when the schema contradicts itself, which isnt a "feature" we use intentionally
                    inferredProperty.inference.exists !== 'CANNOT' &&
                        // Make sure we only have a single type besides null
                        inferredPropertyTypes.filter((type) => type !== 'null')
                            .length === 1 &&
                        // make sure all types are valid
                        inferredPropertyTypes.every((type) =>
                            typesAllowedAsKeys.includes(type)
                        ) &&
                        // make sure the pointer is allowed since server inserts on fields
                        canPointerBeUsedAsKey(inferredProperty.ptr)
                );

                if (
                    isValidKey &&
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

export {
    getProperSchemaScope,
    filterInferSchemaResponse,
    hasReadAndWriteSchema,
    hasReadSchema,
    hasWriteSchema,
    moveUpdatedSchemaToReadSchema,
};
