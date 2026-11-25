import type { AllowedScopes } from 'src/components/editor/MonacoEditor/types';
import type { Schema } from 'src/types';
import type {
    BuiltProjection,
    CollectionSchemaAnnotations,
    RedactionStrategy_Projection,
    RedactionStrategy_Schema,
} from 'src/types/schemaModels';
import type {
    BasicCollectionDef,
    SkimProjectionResponse,
    SplitCollectionDef,
} from 'src/types/wasm';

import {
    cloneDeep,
    get,
    has,
    isEmpty,
    isEqual,
    isPlainObject,
    set,
} from 'lodash';

import { getDiscriminator } from 'src/forms/shared';
import { logRocketConsole } from 'src/services/shared';
import { hasOwnProperty } from 'src/utils/misc-utils';

const allowRedactPrefixes = ['/_meta/before'];
const syntheticPrefixes = ['/_meta'];

const syntheticLocations = ['/_meta', '/_meta/uuid'];

export const evaluateRedactionEligibility = (
    pointer: string | null | undefined
): 'prevent' | 'warning' | 'allowed' => {
    // `flow_document` is the main case for when a pointer is missing
    if (!pointer) {
        return 'prevent';
    }

    // Must be CHECKED FIRST otherwise the "warning"s down below would also catch these
    // Check for allowed first as we never want to accidently stop the user from doing this
    if (allowRedactPrefixes.some((prefix) => pointer.startsWith(prefix))) {
        return 'allowed';
    }

    // See if the pointer is one of these exact matches that we must prevent
    if (syntheticLocations.includes(pointer)) {
        return 'prevent';
    }

    // TODO (redact) - we do not consume this to show a warning (Q1 2026)
    // See if the user is doing something within these sections which are prone to causing issues
    if (syntheticPrefixes.some((prefix) => pointer.startsWith(prefix))) {
        return 'warning';
    }

    // Everything else is allowed
    return 'allowed';
};

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

export const parsePointerEscapeCharacters = (value: string) =>
    value.replace(/~1/g, '/').replace(/~0/g, '~');

interface PointerSegment {
    id: string;
    index: number;
}

const templateSchemaProperties = (
    schema: CollectionSchemaAnnotations,
    rootPath: string,
    targetProperty: { id: string; value: object | undefined },
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
    targetProperty: { id: string; value: object | undefined }
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

// Whether a value in the document, at a location the schema applies to,
// matches what's being searched for
type SchemaMatcher = (schema: Schema, value: unknown) => boolean;

const isObject = (value: unknown): value is Schema =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const escapePointerToken = (token: string) =>
    token.replace(/~/g, '~0').replace(/\//g, '~1');

// The schema is dereferenced before it gets here, except for what `json-refs`
// leaves: references to a location in the same schema, as recursive ones are
const resolveRef = (root: unknown, ref: string): unknown => {
    if (ref === '#') {
        return root;
    }

    const target = ref.startsWith('#/')
        ? get(
              root,
              ref
                  .slice(2)
                  .split('/')
                  .map((token) =>
                      parsePointerEscapeCharacters(decodeURIComponent(token))
                  )
          )
        : undefined;

    if (target === undefined) {
        throw new Error(`Unresolved schema reference: ${ref}`);
    }

    return target;
};

// The nearest `oneOf` or `anyOf` a schema was reached through
export interface SchemaUnion {
    // Location of the union in the document
    pointer: string;
    schema: Schema;
    keyword: 'oneOf' | 'anyOf';
    branch: number;
}

// A matched location, with each union the matching schemas were reached
// through, or `null` for one reached outside of any union
interface MatchedLocation {
    pointer: string;
    unions: (SchemaUnion | null)[];
}

interface Candidate {
    schema: unknown;
    union: SchemaUnion | null;
}

const unionKey = (union: SchemaUnion | null) =>
    union ? `${union.pointer}/${union.keyword}/${union.branch}` : '';

const walk = (
    root: unknown,
    candidates: Candidate[],
    node: unknown,
    pointer: string,
    matches: SchemaMatcher,
    out: MatchedLocation[]
) => {
    if (candidates.length === 0) {
        return;
    }

    // Deduplicate within this location only: recursive schemas must be
    // revisited as we descend through the (finite) config. A schema reached
    // through two union branches is kept once per branch.
    const seen = new Map<Schema, Set<string>>();
    const expanded: Candidate[] = [];
    const matchedUnions: (SchemaUnion | null)[] = [];
    const stack = [...candidates];

    while (stack.length > 0) {
        const candidate = stack.pop()!;
        const { schema, union } = candidate;

        // Boolean schemas carry no keywords
        if (!isObject(schema)) {
            continue;
        }

        const seenUnions = seen.get(schema) ?? new Set<string>();
        if (seenUnions.has(unionKey(union))) {
            continue;
        }

        seenUnions.add(unionKey(union));
        seen.set(schema, seenUnions);
        expanded.push(candidate);

        if (matches(schema, node)) {
            matchedUnions.push(union);
        }

        const push = (...schemas: unknown[]) =>
            schemas.forEach((target) => stack.push({ schema: target, union }));

        if (typeof schema.$ref === 'string') {
            push(resolveRef(root, schema.$ref));
        }

        // A secret under it could be missed, so it isn't walked past
        if (typeof schema.$dynamicRef === 'string') {
            throw new Error(
                `Unresolved schema reference: ${schema.$dynamicRef}`
            );
        }

        if (Array.isArray(schema.allOf)) {
            push(...schema.allOf);
        }

        for (const keyword of ['anyOf', 'oneOf'] as const) {
            if (Array.isArray(schema[keyword])) {
                schema[keyword].forEach((member: unknown, branch: number) =>
                    stack.push({
                        schema: member,
                        union: { pointer, schema, keyword, branch },
                    })
                );
            }
        }

        for (const keyword of ['if', 'then', 'else']) {
            if (keyword in schema) {
                push(schema[keyword]);
            }
        }

        if (isObject(schema.dependentSchemas)) {
            push(...Object.values(schema.dependentSchemas));
        }

        // `not` discards annotations; `propertyNames` describes keys, not
        // values. Definitions apply only when referenced.
    }

    if (matchedUnions.length > 0) {
        out.push({ pointer, unions: matchedUnions });
        return;
    }

    if (isObject(node)) {
        Object.entries(node).forEach(([name, value]) => {
            const children: Candidate[] = [];

            expanded.forEach(({ schema: parent, union }) => {
                const schema = parent as Schema;
                const push = (target: unknown) =>
                    children.push({ schema: target, union });
                let matched = false;

                if (
                    isObject(schema.properties) &&
                    Object.hasOwn(schema.properties, name)
                ) {
                    matched = true;
                    push(schema.properties[name]);
                }

                if (isObject(schema.patternProperties)) {
                    Object.entries(schema.patternProperties).forEach(
                        ([pattern, patternSchema]) => {
                            if (new RegExp(pattern, 'u').test(name)) {
                                matched = true;
                                push(patternSchema);
                            }
                        }
                    );
                }

                // Evaluation depends on branch success, which isn't
                // established here, so this applies to every child.
                if ('unevaluatedProperties' in schema) {
                    push(schema.unevaluatedProperties);
                }

                if (!matched && 'additionalProperties' in schema) {
                    push(schema.additionalProperties);
                }
            });

            walk(
                root,
                children,
                value,
                `${pointer}/${escapePointerToken(name)}`,
                matches,
                out
            );
        });
    } else if (Array.isArray(node)) {
        node.forEach((value, position) => {
            const children: Candidate[] = [];

            expanded.forEach(({ schema: parent, union }) => {
                const schema = parent as Schema;
                const push = (target: unknown) =>
                    children.push({ schema: target, union });

                const prefix = Array.isArray(schema.prefixItems)
                    ? schema.prefixItems[position]
                    : undefined;

                if (prefix !== undefined) {
                    push(prefix);
                } else if ('items' in schema) {
                    push(schema.items);
                }

                if ('contains' in schema) {
                    push(schema.contains);
                }

                if ('unevaluatedItems' in schema) {
                    push(schema.unevaluatedItems);
                }
            });

            walk(root, children, value, `${pointer}/${position}`, matches, out);
        });
    }
};

// `null`, `{}` or `[]`. Unlike lodash's `isEmpty`, scalars like `0`, `false`
// and `''` still count as values.
export const isEmptyJsonValue = (value: unknown) =>
    value === null || (typeof value === 'object' && isEmpty(value));

// JSON pointers to every value in `document` that `matches` accepts against a
// schema applying to it. Ported from flow's
// `crates/validation/src/secrets/plaintext.rs`, so it's deliberately
// conservative: every branch (`oneOf`, `if`/`then`/`else`, ...) counts,
// whether or not the document matches it. A match is reported at its own
// path, and nothing beneath it is searched. Throws when the walk reaches a
// reference that doesn't resolve within the schema.
export const findMatchingLocations = (
    schema: unknown,
    document: unknown,
    matches: SchemaMatcher
): MatchedLocation[] => {
    const out: MatchedLocation[] = [];

    walk(schema, [{ schema, union: null }], document, '', matches, out);

    return out;
};

// JSON pointers into a document

export const toPath = (pointer: string) =>
    pointer.split('/').slice(1).map(parsePointerEscapeCharacters);

export const getAt = (config: unknown, pointer: string) =>
    pointer === '' ? config : get(config, toPath(pointer));

// Whether a value is filled in: not missing, `''`, `null`, `{}` or `[]`
export const hasValue = (value: unknown) =>
    value !== undefined && value !== '' && !isEmptyJsonValue(value);

// Whether `pointer` is `parent` or under it
export const isAtOrUnder = (pointer: string, parent: string) =>
    pointer === parent || pointer.startsWith(`${parent}/`);

// The JSON pointer for a JSON Forms path, e.g. `credentials.password`
export const toJsonPointer = (path: string) =>
    path
        .split('.')
        .filter(Boolean)
        .map((token) => `/${escapePointerToken(token)}`)
        .join('');

// The object or array holding the value at `pointer`, and its key in it
const getParent = (config: unknown, pointer: string) => {
    const path = toPath(pointer);
    const key = path.pop()!;

    return { parent: path.length > 0 ? get(config, path) : config, key };
};

// A copy of `config` without the values at `pointers`. An array item is
// nulled rather than removed, so the pointers after it don't shift.
export const withoutValuesAt = (config: Schema, pointers: string[]): Schema => {
    const result = cloneDeep(config);
    pointers.forEach((pointer) => {
        const { parent, key } = getParent(result, pointer);

        if (Array.isArray(parent) && Number(key) < parent.length) {
            parent[Number(key)] = null;
        } else if (isPlainObject(parent)) {
            delete parent[key];
        }
    });

    return result;
};

// Whether the object or array holding the value at `pointer` exists
export const hasParent = (config: unknown, pointer: string) => {
    const { parent } = getParent(config, pointer);
    return isPlainObject(parent) || Array.isArray(parent);
};

// Which option of a union a document selects

// The value a union branch fixes `property` to, if it fixes one
const getBranchValue = (branch: unknown, property: string) => {
    const schema = get(branch, ['properties', property]);
    if (!isPlainObject(schema)) {
        return undefined;
    }

    return (
        schema.const ??
        (Array.isArray(schema.enum) && schema.enum.length === 1
            ? schema.enum[0]
            : schema.default)
    );
};

// The property that tells a union's branches apart: its `discriminator`, or
// one that every branch fixes to a different value
const getUnionDiscriminator = (
    schema: Schema,
    keyword: SchemaUnion['keyword']
): string | null => {
    const explicit = getDiscriminator(schema);
    if (explicit) {
        return explicit;
    }

    const branches = schema[keyword];
    if (!Array.isArray(branches) || branches.length < 2) {
        return null;
    }

    return (
        Object.keys(get(branches[0], 'properties') ?? {}).find((property) => {
            const values = branches.map((branch) =>
                getBranchValue(branch, property)
            );

            return (
                values.every((value) => value !== undefined) &&
                values.every(
                    (value, index) =>
                        values.findIndex((other) => isEqual(other, value)) ===
                        index
                )
            );
        }) ?? null
    );
};

// The selected branch of a union, or undefined when it can't be told. A
// discriminator decides it. Otherwise it's the branch whose required
// properties are all set and which sets the most of its properties.
export const getSelectedBranch = (union: SchemaUnion, config: unknown) => {
    const branches: unknown[] = union.schema[union.keyword];
    const data = getAt(config, union.pointer);

    const property = getUnionDiscriminator(union.schema, union.keyword);
    if (property) {
        const selected = branches.findIndex((branch) =>
            isEqual(getBranchValue(branch, property), get(data, property))
        );

        return selected === -1 ? undefined : selected;
    }

    const isSet = (name: string) => hasValue(get(data, name));

    const scores = branches.map((branch) => {
        const required: string[] = get(branch, 'required') ?? [];
        if (!required.every(isSet)) {
            return -1;
        }

        return Object.keys(get(branch, 'properties') ?? {}).filter(isSet)
            .length;
    });

    const best = Math.max(...scores);
    const selected = scores.indexOf(best);

    return best >= 0 && scores.lastIndexOf(best) === selected
        ? selected
        : undefined;
};
