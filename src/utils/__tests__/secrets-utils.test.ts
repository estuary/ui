import type { Schema } from 'src/types';

import { cloneDeep } from 'lodash';

import {
    buildSecretsStanza,
    canUseSecrets,
    getMissingSecretFields,
    getSecretFields,
    getSecretName,
    isLegacySecretsConfig,
    prepareSecretsSchema,
    removeSecretValues,
    setSecretsStanza,
} from 'src/utils/secrets-utils';

// A password, plus credentials whose fields depend on the selected auth type
const credentialsSchema: Schema = {
    type: 'object',
    required: ['password'],
    properties: {
        host: { type: 'string' },
        password: { type: 'string', secret: true },
        credentials: {
            type: 'object',
            discriminator: { propertyName: 'auth_type' },
            oneOf: [
                {
                    type: 'object',
                    required: ['api_key'],
                    properties: {
                        auth_type: { type: 'string', const: 'key' },
                        api_key: { type: 'string', secret: true },
                    },
                },
                {
                    type: 'object',
                    required: ['token'],
                    properties: {
                        auth_type: { type: 'string', const: 'token' },
                        token: { type: 'string', secret: true },
                    },
                },
            ],
        },
    },
};

describe('buildSecretsStanza', () => {
    const schema: Schema = {
        type: 'object',
        properties: {
            host: { type: 'string' },
            password: { type: 'string', secret: true },
            credentials: {
                type: 'object',
                discriminator: { propertyName: 'auth_type' },
                oneOf: [
                    {
                        type: 'object',
                        properties: {
                            auth_type: { type: 'string', const: 'key' },
                            api_key: { type: 'string', secret: true },
                        },
                    },
                    {
                        type: 'object',
                        properties: {
                            auth_type: { type: 'string', const: 'token' },
                            token: { type: 'string', secret: true },
                        },
                    },
                ],
            },
        },
    };

    const data = { host: 'example.com', credentials: { auth_type: 'key' } };

    test('includes the named secret fields the data selects', () => {
        expect(
            buildSecretsStanza(schema, data, {
                '/password': 'acmeCo/secret-password',
                '/credentials/api_key': 'acmeCo/secret-api-key',
            })
        ).toEqual({
            'acmeCo/secret-password': '/password',
            'acmeCo/secret-api-key': '/credentials/api_key',
        });
    });

    test('leaves out secret fields without a name', () => {
        expect(
            buildSecretsStanza(schema, data, {
                '/password': 'acmeCo/secret-password',
                '/credentials/api_key': '',
            })
        ).toEqual({ 'acmeCo/secret-password': '/password' });
    });

    test('leaves out secret fields of unselected oneOf options', () => {
        expect(
            buildSecretsStanza(schema, data, {
                '/password': 'acmeCo/secret-password',
                '/credentials/token': 'acmeCo/secret-token',
            })
        ).toEqual({ 'acmeCo/secret-password': '/password' });
    });

    // Entries the UI doesn't manage, e.g. added through the CLI
    test('keeps names for fields that are not secret fields', () => {
        expect(
            buildSecretsStanza(schema, data, {
                '/password': 'acmeCo/secret-password',
                '/host': 'acmeCo/secret-host',
            })
        ).toEqual({
            'acmeCo/secret-password': '/password',
            'acmeCo/secret-host': '/host',
        });
    });

    // e.g. a field a connector upgrade renamed
    test('leaves out names for fields missing from the schema', () => {
        expect(
            buildSecretsStanza(schema, data, {
                '/password': 'acmeCo/secret-password',
                '/old_password': 'acmeCo/secret-old-password',
            })
        ).toEqual({ 'acmeCo/secret-password': '/password' });
    });
});

describe('canUseSecrets', () => {
    const withProperty = (property: Schema): Schema => ({
        type: 'object',
        properties: { field: property },
    });

    test('allows string secrets that are object properties, at any depth', () => {
        expect(canUseSecrets(credentialsSchema)).toBe(true);
        expect(
            canUseSecrets(
                withProperty({
                    type: 'object',
                    properties: {
                        key: { type: 'string', airbyte_secret: true },
                    },
                })
            )
        ).toBe(true);
    });

    test('allows a schema without secrets', () => {
        expect(canUseSecrets(withProperty({ type: 'string' }))).toBe(true);
    });

    test('allows nullable string secrets', () => {
        expect(
            canUseSecrets(
                withProperty({ type: ['string', 'null'], secret: true })
            )
        ).toBe(true);
    });

    // e.g. QuickBooks' rotating OAuth tokens
    test('rejects a secret with a non-empty default', () => {
        expect(
            canUseSecrets(
                withProperty({
                    type: 'string',
                    secret: true,
                    default: 'PLACEHOLDER',
                })
            )
        ).toBe(false);
    });

    test('allows a secret with an empty or null default', () => {
        expect(
            canUseSecrets(
                withProperty({ type: 'string', secret: true, default: '' })
            )
        ).toBe(true);
        expect(
            canUseSecrets(
                withProperty({
                    type: ['string', 'null'],
                    secret: true,
                    default: null,
                })
            )
        ).toBe(true);
    });

    test('rejects a secret that is not a string', () => {
        expect(
            canUseSecrets(withProperty({ type: 'integer', secret: true }))
        ).toBe(false);
    });

    test('rejects a secret inside an array', () => {
        expect(
            canUseSecrets(
                withProperty({
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            password: { type: 'string', secret: true },
                        },
                    },
                })
            )
        ).toBe(false);
    });

    test('rejects a secret under additionalProperties', () => {
        expect(
            canUseSecrets(
                withProperty({
                    type: 'object',
                    additionalProperties: { type: 'string', secret: true },
                })
            )
        ).toBe(false);
    });

    test('rejects a secret that is itself a combinator option', () => {
        expect(
            canUseSecrets(
                withProperty({
                    oneOf: [{ type: 'string', secret: true }, { type: 'null' }],
                })
            )
        ).toBe(false);
    });

    test('rejects OAuth', () => {
        expect(
            canUseSecrets(
                withProperty({
                    'type': 'object',
                    'x-oauth2-provider': 'google',
                    'properties': {
                        client_secret: { type: 'string', secret: true },
                    },
                })
            )
        ).toBe(false);
    });

    test('handles a schema that refers to itself', () => {
        const node: Schema = {
            type: 'object',
            properties: { password: { type: 'string', secret: true } },
        };
        node.properties.child = node;

        expect(canUseSecrets(node)).toBe(true);
    });
});

describe('isLegacySecretsConfig', () => {
    test('a config with sops is legacy', () => {
        expect(isLegacySecretsConfig(credentialsSchema, { sops: {} })).toBe(
            true
        );
    });

    test('a plaintext value in a secret field is legacy', () => {
        expect(
            isLegacySecretsConfig(credentialsSchema, { password: 'hunter2' })
        ).toBe(true);
    });

    // e.g. a nullable secret's schema default
    test('an empty or null secret field is not legacy', () => {
        expect(isLegacySecretsConfig(credentialsSchema, { password: '' })).toBe(
            false
        );
        expect(
            isLegacySecretsConfig(credentialsSchema, { password: null })
        ).toBe(false);
    });

    test('a value under an unselected oneOf option is not legacy', () => {
        expect(
            isLegacySecretsConfig(credentialsSchema, {
                credentials: { auth_type: 'key', token: 'stale' },
            })
        ).toBe(false);
    });

    test('a config that is not an object is not legacy', () => {
        expect(isLegacySecretsConfig(credentialsSchema, null)).toBe(false);
    });
});

describe('getSecretFields', () => {
    test('returns the secret fields of the selected oneOf option', () => {
        expect(
            getSecretFields(credentialsSchema, {
                credentials: { auth_type: 'token' },
            })
        ).toEqual([
            { path: ['password'], pointer: '/password', required: true },
            {
                path: ['credentials', 'token'],
                pointer: '/credentials/token',
                required: true,
            },
        ]);
    });

    test('uses the first non-null option when none is selected', () => {
        const schema: Schema = {
            type: 'object',
            properties: {
                tunnel: {
                    oneOf: [
                        { type: 'null' },
                        {
                            type: 'object',
                            properties: {
                                key: { type: 'string', secret: true },
                            },
                        },
                    ],
                },
            },
        };

        expect(
            getSecretFields(schema, {}).map(({ pointer }) => pointer)
        ).toEqual(['/tunnel/key']);
    });

    test('includes the secret fields of every allOf branch', () => {
        const schema: Schema = {
            type: 'object',
            allOf: [
                { properties: { a: { type: 'string', secret: true } } },
                { properties: { b: { type: 'string', secret: true } } },
            ],
        };

        expect(
            getSecretFields(schema, {}).map(({ pointer }) => pointer)
        ).toEqual(['/a', '/b']);
    });

    test('a nested field is only required while its object is present', () => {
        const requiredAt = (data: any) =>
            getSecretFields(credentialsSchema, data).find(
                ({ pointer }) => pointer === '/credentials/api_key'
            )?.required;

        expect(requiredAt({})).toBe(false);
        expect(requiredAt({ credentials: { auth_type: 'key' } })).toBe(true);
    });

    test('escapes property names in the pointer', () => {
        const schema: Schema = {
            type: 'object',
            properties: { 'a/b': { type: 'string', secret: true } },
        };

        expect(getSecretFields(schema, {})[0].pointer).toBe('/a~1b');
    });
});

describe('getMissingSecretFields', () => {
    const data = { credentials: { auth_type: 'key' } };
    const missingPointers = (
        secretNames: Record<string, string>,
        secretValues: Record<string, string>
    ) =>
        getMissingSecretFields(
            credentialsSchema,
            data,
            secretNames,
            secretValues
        ).map(({ pointer }) => pointer);

    test('lists required fields with neither a secret nor a held value', () => {
        expect(missingPointers({}, {})).toEqual([
            '/password',
            '/credentials/api_key',
        ]);
    });

    test('leaves out fields that refer to a secret', () => {
        expect(
            missingPointers({ '/password': 'acmeCo/secret-password' }, {})
        ).toEqual(['/credentials/api_key']);
    });

    test('leaves out fields with a held value', () => {
        expect(
            missingPointers({}, { '/credentials/api_key': 'key-1' })
        ).toEqual(['/password']);
    });

    test('an empty held value does not count', () => {
        expect(missingPointers({}, { '/credentials/api_key': '' })).toEqual([
            '/password',
            '/credentials/api_key',
        ]);
    });

    test('leaves out optional fields', () => {
        const schema = cloneDeep(credentialsSchema);
        delete schema.required;

        expect(
            getMissingSecretFields(schema, data, {}, {}).map(
                ({ pointer }) => pointer
            )
        ).toEqual(['/credentials/api_key']);
    });
});

describe('removeSecretValues', () => {
    test('removes strings at the selected secret fields, even empty ones', () => {
        expect(
            removeSecretValues(credentialsSchema, {
                host: 'db',
                password: '',
                credentials: { auth_type: 'key', api_key: 'PLACEHOLDER' },
            })
        ).toEqual({ host: 'db', credentials: { auth_type: 'key' } });
    });

    test('keeps null, which holds no value', () => {
        expect(
            removeSecretValues(credentialsSchema, { password: null })
        ).toEqual({ password: null });
    });

    test('leaves the original config as it was', () => {
        const config = { password: 'hunter2' };

        removeSecretValues(credentialsSchema, config);

        expect(config).toEqual({ password: 'hunter2' });
    });
});

describe('getSecretName', () => {
    test.each([
        [
            'acmeCo/example/source-postgres',
            'credentials.password',
            'acmeCo/example/secret-source-postgres-credentials-password',
        ],
        ['source-postgres', 'password', 'secret-source-postgres-password'],
        ['acmeCo/source.v2', 'api key!', 'acmeCo/secret-source.v2-api-key-'],
        ['acmeCo/source_x', 'my_field', 'acmeCo/secret-source_x-my_field'],
    ])('%s + %s -> %s', (taskName, fieldPath, expected) => {
        expect(getSecretName(taskName, fieldPath)).toBe(expected);
    });
});

describe('prepareSecretsSchema', () => {
    test('drops secret fields from required, at every level', () => {
        const prepared = prepareSecretsSchema(credentialsSchema);

        expect(prepared.required).toEqual([]);
        expect(
            prepared.properties.credentials.oneOf.map(
                ({ required }: Schema) => required
            )
        ).toEqual([[], []]);
    });

    test('keeps required fields that are not secrets', () => {
        const schema: Schema = {
            type: 'object',
            required: ['host', 'password'],
            properties: {
                host: { type: 'string' },
                password: { type: 'string', secret: true },
            },
        };

        expect(prepareSecretsSchema(schema).required).toEqual(['host']);
    });

    test('leaves the original schema as it was', () => {
        const original = cloneDeep(credentialsSchema);

        prepareSecretsSchema(credentialsSchema);

        expect(credentialsSchema).toEqual(original);
    });
});

describe('setSecretsStanza', () => {
    const stanza = { 'acmeCo/secret-old': '/old' };

    test('leaves the stanza as is when there is no new one', () => {
        const spec = { secrets: { ...stanza } };

        setSecretsStanza(spec, undefined);

        expect(spec.secrets).toEqual(stanza);
    });

    test('removes the stanza when the new one is empty', () => {
        const spec: any = { secrets: { ...stanza } };

        setSecretsStanza(spec, {});

        expect(spec).not.toHaveProperty('secrets');
    });

    test('replaces the stanza otherwise', () => {
        const spec = { secrets: { ...stanza } };

        setSecretsStanza(spec, { 'acmeCo/secret-new': '/new' });

        expect(spec.secrets).toEqual({ 'acmeCo/secret-new': '/new' });
    });
});
