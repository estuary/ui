import type { Schema } from 'src/types';

import { get } from 'lodash';
import { beforeAll, describe, expect, test } from 'vitest';

import { getDereffedSchema } from 'src/services/jsonforms';
import elasticsearch from 'src/test/fixtures/connector-schemas/materialize-elasticsearch.json';
import iceberg from 'src/test/fixtures/connector-schemas/materialize-iceberg.json';
import httpFile from 'src/test/fixtures/connector-schemas/source-http-file.json';
import mixpanel from 'src/test/fixtures/connector-schemas/source-mixpanel-native.json';
import quickbooks from 'src/test/fixtures/connector-schemas/source-quickbooks.json';
import {
    findMatchingLocations,
    isEmptyJsonValue,
} from 'src/utils/schema-utils';
import {
    buildSecretsWrite,
    getSecretName,
    hasArraySecret,
    isSecretSchema,
    toFormSchema,
} from 'src/utils/secrets-utils';

const SECRET = { secret: true };

// Order isn't part of the contract
// Every value the schema marks secret, in every branch, as the write does
const find = (schema: unknown, config: unknown) =>
    findMatchingLocations(
        schema,
        config,
        (node, value) => isSecretSchema(node) && !isEmptyJsonValue(value)
    )
        .map(({ pointer }) => pointer)
        .sort();

// Cases ported from flow's `crates/validation/src/secrets/plaintext.rs`
describe('findMatchingLocations with secret fields', () => {
    test('counts every branch, whether or not the config matches it', () => {
        const schema = {
            oneOf: [
                {
                    properties: {
                        credentials: { properties: { password: SECRET } },
                    },
                    required: ['missing'],
                },
                {
                    properties: {
                        credentials: {
                            properties: {
                                token: { airbyte_secret: true },
                                password: { secret: false },
                            },
                            required: ['user'],
                        },
                    },
                },
            ],
            properties: { credentials: { type: 'string' } },
        };

        expect(
            find(schema, {
                credentials: { password: 'invented', token: 'invented' },
            })
        ).toEqual(['/credentials/password', '/credentials/token']);
    });

    test('matches pattern and additional properties, escaping the pointer', () => {
        const schema = {
            allOf: [
                {
                    properties: { public: {} },
                    required: ['requiredOnly'],
                    patternProperties: { '^x': {}, 'x$': SECRET },
                    additionalProperties: SECRET,
                },
                { properties: { crossBranch: {} } },
            ],
        };

        expect(
            find(schema, {
                'public': 1,
                'xx': 2,
                'requiredOnly': 3,
                'crossBranch': 4,
                'a~/b': 5,
            })
        ).toEqual(['/a~0~1b', '/crossBranch', '/requiredOnly', '/xx']);
    });

    test('follows array items', () => {
        const schema = {
            properties: {
                tuple: { prefixItems: [{}, SECRET], items: SECRET },
                contains: { contains: { type: 'integer', secret: true } },
                unevaluated: { items: {}, unevaluatedItems: SECRET },
            },
        };

        expect(
            find(schema, {
                tuple: [1, 2, 3],
                contains: ['mismatch'],
                unevaluated: [false],
            })
        ).toEqual(['/contains/0', '/tuple/1', '/tuple/2', '/unevaluated/0']);
    });

    test('follows conditionals and dependent schemas', () => {
        const schema = {
            if: { properties: { predicate: SECRET } },
            then: { properties: { thenValue: SECRET } },
            else: { properties: { elseValue: SECRET } },
            dependentSchemas: {
                missing: { properties: { dependent: SECRET } },
            },
        };

        expect(
            find(schema, {
                predicate: 1,
                thenValue: 2,
                elseValue: 3,
                dependent: 4,
            })
        ).toEqual(['/dependent', '/elseValue', '/predicate', '/thenValue']);
    });

    test('applies unevaluated properties to every property', () => {
        const schema = {
            properties: { known: {} },
            unevaluatedProperties: SECRET,
        };

        expect(find(schema, { known: 1, unknown: 2 })).toEqual([
            '/known',
            '/unknown',
        ]);
    });

    test('ignores not, propertyNames and unreferenced definitions', () => {
        const schema = {
            $defs: { unused: SECRET },
            not: SECRET,
            propertyNames: SECRET,
            properties: { public: { secret: false } },
        };

        expect(find(schema, { public: 1 })).toEqual([]);
    });

    test('reports a secret parent once and skips empty values', () => {
        const schema = {
            properties: {
                parent: { secret: true, properties: { token: SECRET } },
                null: SECRET,
                missing: SECRET,
                emptyObject: SECRET,
                emptyArray: SECRET,
                emptyString: SECRET,
            },
        };

        expect(
            find(schema, {
                parent: { token: 1 },
                null: null,
                emptyObject: {},
                emptyArray: [],
                emptyString: '',
            })
        ).toEqual(['/emptyString', '/parent']);
    });

    test('reports a secret root', () => {
        expect(find(SECRET, { any: 1 })).toEqual(['']);
        expect(find(SECRET, {})).toEqual([]);
    });

    describe('references', () => {
        test('follows recursive references as deep as the config goes', () => {
            const schema = {
                $defs: {
                    node: {
                        allOf: [{ $ref: '#/$defs/node' }],
                        properties: {
                            token: SECRET,
                            next: { $ref: '#/$defs/node' },
                        },
                    },
                },
                $ref: '#/$defs/node',
            };

            expect(
                find(schema, {
                    token: 1,
                    next: { token: 2, next: { token: 3 } },
                })
            ).toEqual(['/next/next/token', '/next/token', '/token']);
        });

        test('throws on a reference that does not resolve', () => {
            expect(() => find({ $ref: '#/$defs/missing' }, { any: 1 })).toThrow(
                'Unresolved schema reference: #/$defs/missing'
            );
        });

        // Dereferencing resolves the rest, so these are never followed
        test.each([
            { $ref: 'https://example.test/auth' },
            { $ref: '#password' },
            { $dynamicRef: '#node' },
        ])('throws on a reference outside the schema: %o', (schema) => {
            expect(() => find(schema, { any: 1 })).toThrow(
                'Unresolved schema reference'
            );
        });
    });
});

// Connector schemas from their `spec`, as the form gets them
const schemas: Record<string, Schema> = {};
beforeAll(async () => {
    const fixtures = { elasticsearch, httpFile, iceberg, mixpanel, quickbooks };
    for (const [key, fixture] of Object.entries(fixtures)) {
        schemas[key] = await getDereffedSchema(fixture);
    }
});

const TASK = 'acmeCo/task';
const nameAt = (pointer: string) => getSecretName(TASK, pointer);

// `stored` and `previous` are pointers to secret names, as the store keeps
// them: the secrets still used, and those at the last load or write
const write = (
    schema: Schema,
    config: Schema,
    {
        stored = {} as Record<string, string>,
        previous = {} as Record<string, string>,
        isEdit = false,
    } = {}
) => buildSecretsWrite(schema, config, stored, previous, TASK, isEdit);

describe('buildSecretsWrite', () => {
    describe('secret field defaults', () => {
        test("a secret field's schema default is never stored as a secret", () => {
            // QuickBooks access_token is a hidden secret with a default field
            const schema = toFormSchema(schemas.quickbooks, []);
            expect(
                get(schema, 'properties.credentials.properties.access_token')
            ).not.toHaveProperty('default');

            const result = write(schema, {
                realm_id: '1234567890',
                credentials: {
                    credentials_title: 'OAuth Credentials',
                    client_id: 'id',
                    client_secret: 'secret',
                    refresh_token: 'token',
                },
            });

            expect(result.secrets).toEqual({
                [nameAt('/credentials/client_id')]: '/credentials/client_id',
                [nameAt('/credentials/client_secret')]:
                    '/credentials/client_secret',
                [nameAt('/credentials/refresh_token')]:
                    '/credentials/refresh_token',
            });
            expect(result.values).toHaveLength(3);
            expect(result.config).toEqual({
                realm_id: '1234567890',
                credentials: { credentials_title: 'OAuth Credentials' },
            });
        });
    });

    describe('oneOf without a discriminator keyword', () => {
        test('stores the secret of the option a const property selects', () => {
            // Mixpanel's credentials options are told apart by a const option_title
            const result = write(schemas.mixpanel, {
                credentials: {
                    option_title: 'Project Secret',
                    api_secret: 'x',
                },
            });

            expect(result.secrets).toEqual({
                [nameAt('/credentials/api_secret')]: '/credentials/api_secret',
            });
            expect(result.values).toEqual([
                [nameAt('/credentials/api_secret'), 'x'],
            ]);
            expect(result.config).toEqual({
                credentials: { option_title: 'Project Secret' },
            });
        });

        test('stores the secret of the option whose fields are filled', () => {
            // Elasticsearch's credentials options have no const to tell them
            // apart: Username and Password, or API Key
            const pointers = (credentials: Schema) =>
                Object.values(
                    write(schemas.elasticsearch, {
                        endpoint: 'http://es:9200',
                        credentials,
                    }).secrets
                );

            expect(pointers({ username: 'elastic', password: 'pw' })).toEqual([
                '/credentials/password',
            ]);
            expect(pointers({ apiKey: 'key' })).toEqual([
                '/credentials/apiKey',
            ]);
        });
    });

    describe('oneOf nested inside another oneOf', () => {
        // Iceberg's catalog credentials, and compute credentials nested in its
        // compute options
        const config = {
            url: 'https://catalog.example.com',
            warehouse: 'warehouse',
            namespace: 'namespace',
            credentials: {
                auth_type: 'OAuth 2.0 Client Credentials',
                oauth2_server_uri: 'v1/oauth/tokens',
                credential: 'catalog-credential',
            },
            compute: {
                compute_type: 'AWS EMR Serverless',
                region: 'us-east-1',
                application_id: 'app',
                execution_role_arn: 'arn:aws:iam::1:role/emr',
                bucket: 'bucket',
                credentials: {
                    auth_type: 'AWSAccessKey',
                    aws_access_key_id: 'AKIA',
                    aws_secret_access_key: 'aws-secret',
                },
            },
        };

        test('stores the secrets of both the outer and the inner option', () => {
            expect(
                Object.values(write(schemas.iceberg, config).secrets)
            ).toEqual([
                '/credentials/credential',
                '/compute/credentials/aws_secret_access_key',
            ]);
        });

        test('stores only the outer secret when the inner option has no secret fields', () => {
            const catalogAuth = {
                ...config,
                compute: {
                    ...config.compute,
                    credentials: { auth_type: 'UseCatalogAuth' },
                },
            };

            expect(
                Object.values(write(schemas.iceberg, catalogAuth).secrets)
            ).toEqual(['/credentials/credential']);
        });
    });

    describe('stored secrets', () => {
        const config = { endpoint: 'http://es:9200', credentials: {} };

        test('go in the stanza and are not stored again', () => {
            const result = write(schemas.elasticsearch, config, {
                stored: { '/credentials/apiKey': 'acmeCo/key' },
            });

            expect(result.secrets).toEqual({
                'acmeCo/key': '/credentials/apiKey',
            });
            expect(result.values).toEqual([]);
            expect(result.config).toEqual(config);
        });

        test.each([
            ['dropped on create', false, {}],
            ['kept on edit', true, { 'otherCo/key': '/credentials/apiKey' }],
        ])(
            'under a different prefix than the task are %s',
            (_outcome, isEdit, expected) => {
                const result = write(schemas.elasticsearch, config, {
                    stored: { '/credentials/apiKey': 'otherCo/key' },
                    isEdit,
                });

                expect(result.secrets).toEqual(expected);
            }
        );

        test('at a field the schema no longer marks secret stay in the stanza', () => {
            const result = write(
                schemas.elasticsearch,
                { ...config, credentials: { apiKey: 'key' } },
                { stored: { '/legacy': 'acmeCo/legacy' } }
            );

            expect(result.secrets['acmeCo/legacy']).toBe('/legacy');
        });
    });

    describe('on edit, a value typed into a secret field', () => {
        const config = {
            endpoint: 'http://es:9200',
            credentials: { username: 'elastic', password: 'new' },
        };

        test("is stored under the stored secret's name", () => {
            const result = write(schemas.elasticsearch, config, {
                stored: { '/credentials/password': 'acmeCo/old' },
                isEdit: true,
            });

            expect(result.secrets).toEqual({
                'acmeCo/old': '/credentials/password',
            });
            expect(result.values).toEqual([['acmeCo/old', 'new']]);
        });

        test("after clearing, is stored under the cleared secret's name", () => {
            const result = write(schemas.elasticsearch, config, {
                previous: { '/credentials/password': 'acmeCo/old' },
                isEdit: true,
            });

            expect(result.values).toEqual([['acmeCo/old', 'new']]);
        });

        test('after clearing, gets a new name when another field still uses the cleared secret', () => {
            const privateKey = '/networkTunnel/sshForwarding/privateKey';
            const result = write(schemas.elasticsearch, config, {
                stored: { [privateKey]: 'acmeCo/old' },
                previous: { '/credentials/password': 'acmeCo/old' },
                isEdit: true,
            });

            expect(result.values).toEqual([
                [nameAt('/credentials/password'), 'new'],
            ]);
            expect(result.secrets['acmeCo/old']).toBe(privateKey);
        });
    });
});

describe('toFormSchema', () => {
    test('a field with a stored secret is no longer required', () => {
        const schema = toFormSchema(schemas.elasticsearch, [
            '/credentials/password',
        ]);

        expect(get(schema, 'properties.credentials.oneOf.0.required')).toEqual([
            'username',
        ]);
    });
});

describe('hasArraySecret', () => {
    // HTTP File has secret header values in array items. Elasticsearch has no
    // arrays with secrets, and Iceberg has an array without secrets.
    test.each([
        [true, 'a secret in array items', 'httpFile'],
        [false, 'secrets only outside arrays', 'elasticsearch'],
        [false, 'an array without secrets', 'iceberg'],
    ])('returns %s for a schema with %s', (expected, _shape, key) => {
        expect(hasArraySecret(schemas[key])).toBe(expected);
    });
});

describe('getSecretName', () => {
    test('is <task prefix>secret-<task>-<field path joined by dashes>-<hash>', () => {
        expect(getSecretName(TASK, '/credentials/password')).toMatch(
            /^acmeCo\/secret-task-credentials-password-[0-9a-z]+$/
        );
    });

    test('differs for two tasks whose task and field names join to the same text', () => {
        expect(
            getSecretName('acmeCo/source-postgres', '/credentials/password')
        ).not.toBe(
            getSecretName('acmeCo/source-postgres-credentials', '/password')
        );
    });
});
