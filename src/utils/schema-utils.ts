import type { AllowedScopes } from 'src/components/editor/MonacoEditor/types';
import type { Schema } from 'src/types';
import type {
    BuiltProjection,
    CollectionSchema,
    CollectionSchemaAnnotations,
    RedactionStrategy_Projection,
    RedactionStrategy_Schema,
} from 'src/types/schemaModels';
import type { WithRequiredProperty } from 'src/types/utils';
import type {
    BasicCollectionDef,
    SkimProjectionResponse,
    SplitCollectionDef,
} from 'src/types/wasm';

import { has, isEmpty, isPlainObject, set } from 'lodash';

import { logRocketConsole } from 'src/services/shared';
import { hasOwnProperty } from 'src/utils/misc-utils';

// These are inserted by the server and never would make sense as keys
//  Make sure you lowercase these
const invalidKeyPointers = [
    '/_meta/uuid',
    '/_meta/flow_truncated',
    '/_meta/inferredschemaisnotavailable',
];
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
    return Boolean(hasReadSchema(spec) && hasWriteSchema(spec));
};

export const getReadSchemaProperty = (collectionSpec: any) =>
    hasReadSchema(collectionSpec)
        ? 'readSchema'
        : hasOwnProperty(collectionSpec, 'schema')
          ? 'schema'
          : undefined;

export const getWriteSchemaProperty = (collectionSpec: any) =>
    hasWriteSchema(collectionSpec)
        ? 'writeSchema'
        : hasOwnProperty(collectionSpec, 'schema')
          ? 'schema'
          : undefined;

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
    skimProjectionResponse: SkimProjectionResponse | null
) => {
    const validKeys: string[] = [];
    let fields: BuiltProjection[] | null = null;

    if (skimProjectionResponse) {
        const { projections } = skimProjectionResponse;

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

const getSchemaForProjectionModel = (spec: any) => {
    // TODO (infer - typing)
    let schemaProjectionModel: null | BasicCollectionDef | SplitCollectionDef =
        null;
    const usingReadSchema = hasReadSchema(spec);
    const usingWriteSchema = hasWriteSchema(spec);
    const usingReadAndWriteSchema = usingReadSchema && usingWriteSchema;

    if (usingReadAndWriteSchema) {
        if (isPlainObject(spec.readSchema) && isPlainObject(spec.writeSchema)) {
            schemaProjectionModel = {
                readSchema: spec.readSchema,
                writeSchema: spec.writeSchema,
            } as SplitCollectionDef;
        }
    } else {
        if (isPlainObject(spec.schema)) {
            schemaProjectionModel = {
                schema: spec.schema,
            } as BasicCollectionDef;
        }
    }

    return {
        usingReadAndWriteSchema,
        schemaProjectionModel,
    };
};

export {
    getSchemaForProjectionModel,
    getProperSchemaScope,
    filterSkimProjectionResponse,
    hasReadAndWriteSchema,
    hasReadSchema,
    hasWriteSchema,
    moveUpdatedSchemaToReadSchema,
    reduceBuiltProjections,
};

export const isCollectionSchemaWithProperties = (
    value: WithRequiredProperty<CollectionSchema, 'properties'>
): value is WithRequiredProperty<CollectionSchema, 'properties'> =>
    'properties' in value;

export const parsePointerEscapeCharacters = (value: string) =>
    value.replace(/~1/g, '/').replace(/~0/g, '~');

interface PointerSegment {
    id: string;
    index: number;
}

const templateSchemaProperties = (
    schema: CollectionSchemaAnnotations,
    rootPath: string,
    targetProperty: {
        id: string;
        value: object | string | number | boolean | undefined;
    },
    pointerSegments: PointerSegment[],
    targetSegment: PointerSegment
): void => {
    let nextRootPath = `${rootPath}.${targetSegment.id}`;

    if (!has(schema, nextRootPath)) {
        set(schema, nextRootPath, {});
    }

    if (targetSegment.index !== pointerSegments.length - 1) {
        nextRootPath = `${nextRootPath}.properties`;

        if (!has(schema, nextRootPath)) {
            set(schema, nextRootPath, {});
        }

        templateSchemaProperties(
            schema,
            nextRootPath,
            targetProperty,
            pointerSegments,
            pointerSegments[targetSegment.index + 1]
        );

        return;
    }

    set(schema, `${nextRootPath}.${targetProperty.id}`, targetProperty.value);
    logRocketConsole('redact:set:final_path', { path: nextRootPath });
};

export const setSchemaProperties = (
    schema: any,
    pointer: string | undefined,
    targetProperty: {
        id: string;
        value: object | string | number | boolean | undefined;
    }
): void => {
    if (!pointer) {
        return;
    }

    const pointerSegments: PointerSegment[] = pointer
        .split('/')
        .filter((id) => id.length !== 0)
        .map((id, index) => ({ id: parsePointerEscapeCharacters(id), index }));

    schema.properties ??= {};

    templateSchemaProperties(
        schema,
        'properties',
        targetProperty,
        pointerSegments,
        pointerSegments[0]
    );
};

export const translateRedactionStrategy = (
    value: RedactionStrategy_Projection | null | undefined
): RedactionStrategy_Schema | null => {
    switch (value) {
        case 'REDACT_BLOCK':
            return 'block';
        case 'REDACT_SHA256':
            return 'sha256';
        default:
            return null;
    }
};
