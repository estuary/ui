import type { Schema } from 'src/types';

import { cloneDeep, isPlainObject, set } from 'lodash';

import { getParentPrefix } from 'src/utils/names';
import {
    findMatchingLocations,
    getAt,
    getSelectedBranch,
    hasParent,
    hasValue,
    isEmptyJsonValue,
    toPath,
    withoutValuesAt,
} from 'src/utils/schema-utils';

// The shard flag for the V2 runtime, which a `secrets` stanza requires
export const ENABLE_RUNTIME_V2 = 'enable-runtime-v2';

const NAME_CHARACTERS = /[^\p{Letter}\p{Number}\-_]/gu;
// Stands in for a stored secret in a copy of the config, so it counts as
// filled when telling which union option is selected. Never leaves here.
const STORED_SECRET_PLACEHOLDER = '\u0000stored-secret';

export const isSecretSchema = (schema: Schema) =>
    schema.secret === true || schema.airbyte_secret === true;

interface SecretLocation {
    pointer: string;
    // The value to store as the secret. Missing when the config has none.
    value?: unknown;
}

const isSecretValue = (schema: Schema, value: unknown) =>
    isSecretSchema(schema) && !isEmptyJsonValue(value);

// Every location in `config` that holds a secret's value. The form's data
// only has the selected option of each union, so these are all in use.
const findSecretLocations = (
    schema: Schema,
    config: unknown
): SecretLocation[] =>
    findMatchingLocations(schema, config, isSecretValue).map(({ pointer }) => {
        const value = getAt(config, pointer);
        return { pointer, value: hasValue(value) ? value : undefined };
    });

// A secret is a sibling of the task that uses it, e.g. `acmeCo/task`'s
// `/credentials/password` is `acmeCo/secret-task-credentials-password-<hash>`.
// The hash of the task name and pointer keeps names that read the same apart.
export const getSecretName = (taskName: string, pointer: string) => {
    const tokens = toPath(pointer).map((token) =>
        token.replace(NAME_CHARACTERS, '_')
    );
    const prefix = getParentPrefix(taskName);
    const task = taskName.slice(prefix.length).replace(NAME_CHARACTERS, '_');

    // Computes the djb2 hash (quick hash) of the name and field pointer to
    // append to the secret name. This prevents conflicts across tasks in the
    // unlikely event the combination of task name and field pointer is the same.
    // `#` can't appear in a catalog name, so the input is unambiguous
    const suffix = djb2Hash(`${taskName}#${pointer}`);

    return `${prefix}secret-${task}-${tokens.join('-')}-${suffix}`;
};

interface SecretsWrite {
    // The config without secret values, to write to the spec
    config: Schema;
    // The `secrets` stanza: names to pointers
    secrets: Record<string, string>;
    // New values to set, as `[name, value]`
    values: [string, unknown][];
}

// A `secrets` stanza, names to pointers, as the store keeps it: pointers to
// names
export const toSecretNames = (
    secrets: Record<string, string> | null | undefined
): Record<string, string> =>
    Object.fromEntries(
        Object.entries(secrets ?? {}).map(([name, pointer]) => [pointer, name])
    );

// Whether a value typed at `pointer` replaces a stored secret: the task's own
// secret for the field, stored there or cleared from there since the last write
export const replacesStoredSecret = (
    catalogName: string,
    pointer: string,
    secretNames: Record<string, string>,
    savedSecretNames: Record<string, string>
) => {
    const name = getSecretName(catalogName, pointer);

    return secretNames[pointer] === name || savedSecretNames[pointer] === name;
};

// What writing `config` takes: values typed into secret fields are set as
// secrets, and the stanza names those along with the stored secrets in
// `secretNames` (pointers to names). A typed value is always set under the
// name the task and field give, never one from the spec, so a spec can't point
// it at another secret. On create, stored secrets under another prefix are
// dropped.
export const buildSecretsWrite = (
    schema: Schema,
    config: Schema,
    secretNames: Record<string, string>,
    catalogName: string,
    isEdit: boolean
): SecretsWrite => {
    const prefix = getParentPrefix(catalogName);

    // Pointers to names, so a new name replaces the one at its location
    const stanza = Object.fromEntries(
        Object.entries(secretNames).filter(
            ([, name]) => isEdit || getParentPrefix(name) === prefix
        )
    );

    const locations = findSecretLocations(schema, config);
    const values: [string, unknown][] = [];

    locations.forEach(({ pointer, value }) => {
        if (value === undefined) {
            return;
        }

        const name = getSecretName(catalogName, pointer);
        values.push([name, value]);
        stanza[pointer] = name;
    });

    return {
        config: withoutValuesAt(
            config,
            locations.map(({ pointer }) => pointer)
        ),
        secrets: Object.fromEntries(
            Object.entries(stanza).map(([pointer, name]) => [name, pointer])
        ),
        values,
    };
};

const withStoredSecrets = (config: unknown, pointers: string[]) => {
    const walked = cloneDeep(config ?? {}) as Schema;
    pointers.forEach((pointer) => {
        if (pointer !== '' && !hasValue(getAt(walked, pointer))) {
            set(walked, toPath(pointer), STORED_SECRET_PLACEHOLDER);
        }
    });

    return walked;
};

// The secrets in `config`, counting the stored ones at `pointers` as filled,
// and the option each union they're under has selected, by union pointer: the
// one its discriminator names, or else the one the config fits. A union whose
// option can't be told is left out.
const locateSecrets = (schema: Schema, config: unknown, pointers: string[]) => {
    const walked = withStoredSecrets(config, pointers);
    const locations = findMatchingLocations(schema, walked, isSecretValue);
    const selected: Record<string, number> = {};

    locations.forEach(({ unions }) =>
        unions.forEach((union) => {
            if (!union || union.pointer in selected) {
                return;
            }

            const branch = getSelectedBranch(union, walked);
            if (branch !== undefined) {
                selected[union.pointer] = branch;
            }
        })
    );

    return { locations, selected };
};

// The option each union with a secret has selected, by union pointer
export const getSelectedOptions = (
    schema: Schema,
    config: unknown,
    secretNames: Record<string, string>
) => locateSecrets(schema, config, Object.keys(secretNames)).selected;

// The stored secrets still in use: their field still exists in `config`,
// and is in the selected option of each union it's under, as tracked in
// `selectedOptions` or else told from the config. A stored secret where the
// schema no longer has a secret is kept.
export const getActiveSecretNames = (
    schema: Schema,
    config: unknown,
    secretNames: Record<string, string>,
    selectedOptions: Record<string, number>
): Record<string, string> => {
    const present = Object.keys(secretNames).filter((pointer) =>
        hasParent(config, pointer)
    );
    const { locations, selected } = locateSecrets(schema, config, present);
    const options = { ...selected, ...selectedOptions };
    const unionsAt = new Map(
        locations.map(({ pointer, unions }) => [pointer, unions])
    );

    return Object.fromEntries(
        Object.entries(secretNames).filter(([pointer]) => {
            if (!present.includes(pointer)) {
                return false;
            }

            const unions = unionsAt.get(pointer);

            // A union whose option can't be told counts as selected
            return (
                !unions ||
                unions.some(
                    (union) =>
                        !union ||
                        (options[union.pointer] ?? union.branch) ===
                            union.branch
                )
            );
        })
    );
};

// Whether `schema` has a secret inside an array. Array items have no stable
// identity to keep a secret with, so those tasks stay on sops.
export const hasArraySecret = (schema: Schema) => {
    const ancestors = new Set<object>();

    const visit = (node: unknown, inArray: boolean): boolean => {
        if (!isPlainObject(node) || ancestors.has(node as object)) {
            return false;
        }

        const current = node as Schema;
        if (isSecretSchema(current)) {
            return inArray;
        }

        const members = ['allOf', 'anyOf', 'oneOf'].flatMap((keyword) =>
            Array.isArray(current[keyword]) ? current[keyword] : []
        );
        const children: unknown[] = [
            ...members,
            current.if,
            current.then,
            current.else,
            ...Object.values(current.properties ?? {}),
            ...Object.values(current.patternProperties ?? {}),
            current.additionalProperties,
        ];
        const items = [
            current.items,
            current.prefixItems,
            current.additionalItems,
        ].flat();

        ancestors.add(current);
        const found =
            children.some((child) => visit(child, inArray)) ||
            items.some((child) => visit(child, true));
        ancestors.delete(current);

        return found;
    };

    return visit(schema, false);
};

// The schema the form uses when the task uses secrets. Secret fields have no
// default, so the form doesn't fill in a value nobody entered (left out, the
// connector applies its own). Nothing at `storedPointers` is required, as
// those fields already have a stored secret.
export const toFormSchema = (
    schema: Schema,
    storedPointers: string[]
): Schema => {
    const result = cloneDeep(schema);
    const visited = new WeakSet<object>();

    const dropSecretDefaults = (node: unknown) => {
        if (typeof node !== 'object' || node === null || visited.has(node)) {
            return;
        }
        visited.add(node);

        if (isPlainObject(node) && isSecretSchema(node as Schema)) {
            delete (node as Schema).default;
        }

        Object.values(node).forEach(dropSecretDefaults);
    };

    const makeOptional = (node: unknown, path: string[]) => {
        if (!isPlainObject(node) || path.length === 0) {
            return;
        }

        const current = node as Schema;
        const [name, ...rest] = path;

        if (rest.length === 0 && Array.isArray(current.required)) {
            current.required = current.required.filter(
                (required: string) => required !== name
            );
        }

        ['allOf', 'anyOf', 'oneOf'].forEach((keyword) => {
            if (Array.isArray(current[keyword])) {
                current[keyword].forEach((member: unknown) =>
                    makeOptional(member, path)
                );
            }
        });
        ['if', 'then', 'else'].forEach((keyword) =>
            makeOptional(current[keyword], path)
        );

        if (isPlainObject(current.properties)) {
            makeOptional(current.properties[name], rest);
        }
    };

    dropSecretDefaults(result);
    storedPointers.forEach((pointer) => makeOptional(result, toPath(pointer)));

    return result;
};

const djb2Hash = (value: string) => {
    let hash = 5381;
    for (const character of value) {
        hash = (hash * 33) ^ character.charCodeAt(0);
    }

    return (hash >>> 0).toString(36);
};
