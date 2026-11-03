import type { Schema } from 'src/types';

import { buildSecretsStanza } from 'src/utils/secrets-utils';

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
