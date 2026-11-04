import type { Schema } from 'src/types';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAddSecretsToSpecDef } from 'src/components/shared/Entity/hooks/useAddSecretsToSpecDef';
import { useSetSecret } from 'src/hooks/secrets/useSetSecret';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import {
    useSecretsStore_secretNames,
    useSecretsStore_secretValues,
    useSecretsStore_serverUpdateRequired,
    useSecretsStore_setSecretName,
    useSecretsStore_usesSecrets,
} from 'src/stores/Secrets/hooks';

vi.mock(import('src/hooks/secrets/useSetSecret'), () => ({
    useSetSecret: vi.fn(),
}));

vi.mock(import('src/stores/Secrets/hooks'), async (importOriginal) => ({
    ...(await importOriginal()),
    useSecretsStore_secretNames: vi.fn(),
    useSecretsStore_secretValues: vi.fn(),
    useSecretsStore_serverUpdateRequired: vi.fn(),
    useSecretsStore_setSecretName: vi.fn(),
    useSecretsStore_usesSecrets: vi.fn(),
}));

const TASK_NAME = 'acmeCo/source-postgres';
const RENAMED_TASK_NAME = 'acmeCo/source-postgres-v2';
const PASSWORD_SECRET = 'acmeCo/secret-source-postgres-password';
const API_KEY_SECRET = 'acmeCo/secret-source-postgres-credentials-api_key';

const endpointSchema: Schema = {
    type: 'object',
    properties: {
        password: { type: 'string', secret: true },
        credentials: {
            type: 'object',
            properties: { api_key: { type: 'string', secret: true } },
        },
    },
};

const specDef = (
    secrets?: Record<string, string>,
    config: object = {}
): any => ({
    bindings: [],
    endpoint: { connector: { image: 'source-postgres:dev', config } },
    ...(secrets ? { secrets } : {}),
});

const setSecret = vi.fn();
const setSecretName = vi.fn();

// The Secrets store's state the hook reads
const renderAddSecrets = ({
    usesSecrets = true,
    secretNames = {},
    secretValues = {},
    serverUpdateRequired = false,
}: {
    usesSecrets?: boolean;
    secretNames?: Record<string, string>;
    secretValues?: Record<string, string>;
    serverUpdateRequired?: boolean;
} = {}) => {
    vi.mocked(useSecretsStore_usesSecrets).mockReturnValue(usesSecrets);
    vi.mocked(useSecretsStore_secretNames).mockReturnValue(secretNames);
    vi.mocked(useSecretsStore_secretValues).mockReturnValue(secretValues);
    vi.mocked(useSecretsStore_serverUpdateRequired).mockReturnValue(
        serverUpdateRequired
    );

    return renderHook(() => useAddSecretsToSpecDef()).result.current;
};

describe('useAddSecretsToSpecDef', () => {
    beforeEach(() => {
        setSecret.mockReset();
        setSecret.mockResolvedValue({});
        vi.mocked(useSetSecret).mockReturnValue(setSecret);

        setSecretName.mockReset();
        vi.mocked(useSecretsStore_setSecretName).mockReturnValue(setSecretName);

        useEndpointConfigStore.setState({
            endpointSchema,
            endpointConfig: { data: {} },
        });
    });

    test('does nothing for a task that does not use secrets', async () => {
        const spec = specDef({ [PASSWORD_SECRET]: '/password' });

        const error = await renderAddSecrets({
            usesSecrets: false,
            secretValues: { '/password': 'hunter2' },
        })(TASK_NAME, spec);

        expect(error).toBeNull();
        expect(setSecret).not.toHaveBeenCalled();
        expect(spec.secrets).toEqual({ [PASSWORD_SECRET]: '/password' });
    });

    test('saves a held value under a name from the task and refers to it', async () => {
        const spec = specDef();

        const error = await renderAddSecrets({
            secretValues: { '/credentials/api_key': 'key-1' },
        })(TASK_NAME, spec);

        expect(error).toBeNull();
        expect(setSecret).toHaveBeenCalledWith(API_KEY_SECRET, 'key-1');
        expect(setSecretName).toHaveBeenCalledWith(
            '/credentials/api_key',
            API_KEY_SECRET
        );
        expect(spec.secrets).toEqual({
            [API_KEY_SECRET]: '/credentials/api_key',
        });
    });

    test('saves the value again under the new name when the task is renamed', async () => {
        const spec = specDef({ [PASSWORD_SECRET]: '/password' });
        const renamedSecret = 'acmeCo/secret-source-postgres-v2-password';

        await renderAddSecrets({
            secretNames: { '/password': PASSWORD_SECRET },
            secretValues: { '/password': 'hunter2' },
        })(RENAMED_TASK_NAME, spec);

        expect(setSecret).toHaveBeenCalledWith(renamedSecret, 'hunter2');
        expect(spec.secrets).toEqual({ [renamedSecret]: '/password' });
    });

    test('skips saving a value already saved under its name', async () => {
        const spec = specDef();

        await renderAddSecrets({
            secretNames: { '/password': PASSWORD_SECRET },
            secretValues: { '/password': 'hunter2' },
        })(TASK_NAME, spec);

        expect(setSecret).not.toHaveBeenCalled();
        expect(spec.secrets).toEqual({ [PASSWORD_SECRET]: '/password' });
    });

    test('saves it again when the server needs an update', async () => {
        await renderAddSecrets({
            secretNames: { '/password': PASSWORD_SECRET },
            secretValues: { '/password': 'hunter2' },
            serverUpdateRequired: true,
        })(TASK_NAME, specDef());

        expect(setSecret).toHaveBeenCalledWith(PASSWORD_SECRET, 'hunter2');
    });

    test('refers to existing secrets without a held value', async () => {
        const spec = specDef();

        await renderAddSecrets({
            secretNames: { '/password': PASSWORD_SECRET },
        })(TASK_NAME, spec);

        expect(setSecret).not.toHaveBeenCalled();
        expect(spec.secrets).toEqual({ [PASSWORD_SECRET]: '/password' });
    });

    test('returns the save error and leaves the stanza as it was', async () => {
        const saveError = new Error('encryption failed');
        setSecret.mockRejectedValue(saveError);
        const spec = specDef({ [PASSWORD_SECRET]: '/password' });

        const error = await renderAddSecrets({
            secretValues: { '/credentials/api_key': 'key-1' },
        })(TASK_NAME, spec);

        expect(error).toBe(saveError);
        expect(setSecretName).not.toHaveBeenCalled();
        expect(spec.secrets).toEqual({ [PASSWORD_SECRET]: '/password' });
    });

    test('skips an empty held value', async () => {
        await renderAddSecrets({ secretValues: { '/password': '' } })(
            TASK_NAME,
            specDef()
        );

        expect(setSecret).not.toHaveBeenCalled();
    });

    // e.g. a form default or a reset oneOf option
    test('drafts no value at secret fields, without changing the config passed in', async () => {
        const config = Object.freeze({
            host: 'db',
            password: '',
            credentials: Object.freeze({ api_key: 'leftover' }),
        });
        const spec = specDef(undefined, config);

        await renderAddSecrets()(TASK_NAME, spec);

        expect(spec.endpoint.connector.config).toEqual({
            host: 'db',
            credentials: {},
        });
        expect(config.password).toBe('');
    });
});
