import type { Schema } from 'src/types';
import type { SecretsStanza } from 'src/types/schemaModels';

import { encodePointer } from 'json-ptr';
import {
    castArray,
    cloneDeep,
    forEach,
    get,
    isEmpty,
    isPlainObject,
    isString,
    some,
    values,
} from 'lodash';

import { getDiscriminatorIndex } from 'src/forms/shared';
import { Annotations } from 'src/types/jsonforms';

export function isSecretSchema(schema: unknown): schema is Schema {
    return (
        isPlainObject(schema) &&
        hasSecretAnnotation(schema as Schema) &&
        isStringSchema(schema as Schema)
    );
}

// Convertes dot-separated paths (e.g. from JSON Forms) to path separated.
// e.g. `credentials.password` -> `/credentials/password`
export function toJsonPointer(path: string) {
    return encodePointer(path.split('.'));
}

// Secrets are supported for plain string properties of objects. A secret
// anywhere else (inside an array, or as a combinator option) has no stable
// pointer, and OAuth needs the sops flow to inject client credentials.
export function canUseSecrets(schema: Schema): boolean {
    const seen = new WeakSet<object>();

    function supported(node: unknown, viaProperty: boolean): boolean {
        if (!isPlainObject(node)) {
            return true;
        }

        const current = node as Schema;
        if (seen.has(current)) {
            return true;
        }
        seen.add(current);

        if (current[Annotations.oAuthProvider]) {
            return false;
        }

        if (hasSecretAnnotation(current)) {
            return viaProperty && isStringSchema(current);
        }

        return (
            values(current.properties).every((property) =>
                supported(property, true)
            ) &&
            childSchemas(current).every((child) => supported(child, false)) &&
            !containsSecret(current.items) &&
            !containsSecret(current.additionalProperties)
        );
    }

    return supported(schema, false);
}

// A config with sops, or with plaintext secret values, keeps the legacy flow:
// a config uses either sops or a `secrets` stanza, never both.
export function isLegacySecretsConfig(schema: Schema, config: any) {
    return (
        isPlainObject(config) &&
        (Object.hasOwn(config, 'sops') ||
            getSecretFields(schema, config).some(({ path }) =>
                isSetValue(get(config, path))
            ))
    );
}

// The form's copy of the schema: drops secret fields from `required`, since
// their values live in secrets rather than the config. Requiredness comes from
// `getSecretFields` on the original schema instead.
export function prepareSecretsSchema(schema: Schema): Schema {
    const prepared = cloneDeep(schema);
    const seen = new WeakSet<object>();

    function visit(node: unknown) {
        if (!isPlainObject(node) || seen.has(node as object)) {
            return;
        }

        const current = node as Schema;
        seen.add(current);

        forEach(current.properties, (property, key) => {
            if (!isSecretSchema(property)) {
                visit(property);
            } else if (Array.isArray(current.required)) {
                current.required = current.required.filter(
                    (requiredKey: string) => requiredKey !== key
                );
            }
        });

        childSchemas(current).forEach(visit);
    }

    visit(prepared);

    return prepared;
}

// The `secrets` stanza for the secret fields `data` selects, from the secret
// name each field refers to (keyed by pointer). Fields of unselected oneOf
// options are left out. Names for schema fields that aren't secret fields
// (e.g. added through the CLI) aren't the form's to manage, so they're kept.
export function buildSecretsStanza(
    schema: Schema,
    data: any,
    secretNames: Record<string, string>
): SecretsStanza {
    const stanza: SecretsStanza = {};
    const schemaPointers = getSchemaPointers(schema);

    forEach(secretNames, (name, pointer) => {
        if (isSetValue(name) && schemaPointers.get(pointer) === false) {
            stanza[name] = pointer;
        }
    });

    getSecretFields(schema, data).forEach(({ pointer }) => {
        const name = secretNames[pointer];

        if (isSetValue(name)) {
            stanza[name] = pointer;
        }
    });

    return stanza;
}

// Required secret fields `data` selects that neither refer to a secret yet nor
// have a value waiting to be saved (in create, until the draft exists)
export function getMissingSecretFields(
    schema: Schema,
    data: any,
    secretNames: Record<string, string>,
    secretValues: Record<string, string>
) {
    return getSecretFields(schema, data).filter(
        ({ pointer, required }) =>
            required &&
            !isSetValue(secretNames[pointer]) &&
            !Object.hasOwn(secretValues, pointer)
    );
}

/**
 * Applies a task's `secrets` stanza to its spec:
 *  - undefined: leaves the spec's stanza as is. Either the task uses sops, or
 *    neither its config nor its secrets changed, so its existing stanza still
 *    applies.
 *  - Empty: no selected field has a secret, e.g. after switching to a `oneOf` option without
 *    one. Results in the stanza being removed.
 *  - Otherwise the incoming stanza replaces the spec's stanza.
 */
export function setSecretsStanza(spec: any, secrets?: SecretsStanza) {
    if (!secrets) {
        return;
    }

    if (isEmpty(secrets)) {
        delete spec.secrets;
    } else {
        spec.secrets = secrets;
    }
}

/**
 * Generates the name for a secret, given the task name and field name of the
 * secret. Secret names are prefixed with `secret-` to prevent collisions. For
 * example:
 * `getSecretName('acmeCo/example/source-postgres', 'credentials.password') ->
 * acmeCo/example/secret-source-postgres-credentials-password`
 *
 * The secret stays in the task's prefix, since tasks can only read sibling
 * secrets.
 */
export function getSecretName(taskName: string, fieldPath: string) {
    const slash = taskName.lastIndexOf('/') + 1;
    const leaf = [taskName.slice(slash), ...fieldPath.split('.')]
        .join('-')
        .replace(/[^a-zA-Z0-9-_.]/g, '-');

    return `${taskName.slice(0, slash)}secret-${leaf}`;
}

function hasSecretAnnotation(schema: Schema) {
    return (
        schema[Annotations.secret] === true ||
        schema[Annotations.secretAirbyte] === true
    );
}

function isStringSchema(schema: Schema) {
    return castArray(schema.type).includes('string');
}

function childSchemas(schema: Schema): Schema[] {
    return ['oneOf', 'anyOf', 'allOf']
        .flatMap((keyword) => schema[keyword] ?? [])
        .filter(isPlainObject);
}

function containsSecret(
    node: unknown,
    seen: WeakSet<object> = new WeakSet()
): boolean {
    if (Array.isArray(node)) {
        return some(node, (item) => containsSecret(item, seen));
    }

    if (!isPlainObject(node) || seen.has(node as object)) {
        return false;
    }

    const current = node as Schema;
    seen.add(current);

    return (
        hasSecretAnnotation(current) ||
        some(current, (value) => containsSecret(value, seen))
    );
}

interface SecretField {
    path: string[];
    pointer: string;
    // As in JSON Schema, only when the object holding the field is present
    required: boolean;
}

// The secret fields of the schema branches `data` selects
export function getSecretFields(schema: Schema, data: any): SecretField[] {
    const fields: SecretField[] = [];

    function visit(node: unknown, value: any, path: string[]) {
        if (!isPlainObject(node)) {
            return;
        }

        const current = node as Schema;

        forEach(current.properties, (property, key) => {
            const childPath = [...path, key];

            if (isSecretSchema(property)) {
                fields.push({
                    path: childPath,
                    pointer: encodePointer(childPath),
                    required:
                        isPlainObject(value) &&
                        Array.isArray(current.required) &&
                        current.required.includes(key),
                });
            } else {
                visit(property, value?.[key], childPath);
            }
        });

        ['oneOf', 'anyOf'].forEach((keyword) => {
            if (Array.isArray(current[keyword])) {
                visit(pickOption(current, value, keyword), value, path);
            }
        });

        forEach(current.allOf, (option) => visit(option, value, path));
    }

    visit(schema, data, []);

    return fields;
}

// Every property pointer in the schema, across all combinator options, and
// whether it's a secret field in any of them
function getSchemaPointers(schema: Schema): Map<string, boolean> {
    const pointers = new Map<string, boolean>();
    const seen = new WeakSet<object>();

    function visit(node: unknown, path: string[]) {
        if (!isPlainObject(node) || seen.has(node as object)) {
            return;
        }

        const current = node as Schema;
        seen.add(current);

        forEach(current.properties, (property, key) => {
            const childPath = [...path, key];
            const pointer = encodePointer(childPath);
            const secret = isSecretSchema(property);

            pointers.set(pointer, Boolean(pointers.get(pointer)) || secret);

            if (!secret) {
                visit(property, childPath);
            }
        });

        childSchemas(current).forEach((child) => visit(child, path));
    }

    visit(schema, []);

    return pointers;
}

function pickOption(schema: Schema, data: any, keyword: string) {
    const options: Schema[] = schema[keyword];
    const index = getDiscriminatorIndex(schema, data, keyword);

    return index !== undefined
        ? options[index]
        : options.find(
              (option) => isPlainObject(option) && option.type !== 'null'
          );
}

function isSetValue(value: unknown): value is string {
    return isString(value) && !isEmpty(value);
}
