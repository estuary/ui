import type { AllowedScopes } from 'src/components/editor/MonacoEditor/types';
import type { SkimProjectionResponse } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';

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

export const hasWriteSchema = (spec: any) => {
    return spec.hasOwnProperty('writeSchema');
};

export const hasReadSchema = (spec: any) => {
    return spec.hasOwnProperty('readSchema');
};

export const hasReadAndWriteSchema = (spec: any) => {
    return Boolean(hasReadSchema(spec) && hasReadSchema(spec));
};

export const getProperSchemaScope = (spec: any) => {
    const readSchemaExists = hasReadSchema(spec);

    let key: AllowedScopes;
    if (readSchemaExists) {
        key = 'readSchema';
    } else {
        key = 'schema';
    }

    return [key, readSchemaExists];
};

// Reduce down to get rid of duplicate pointers. We do this mainly so
//  projections do not show the same pointer multiple times. We _could_ filter
//  on the explicit property however there are times where certain projections (patterns)
//  would be a valid reason to use a projection as part of the key
export const reduceBuiltProjections = (
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

export const filterSkimProjectionResponse = (
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
