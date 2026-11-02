import { renderHook } from '@testing-library/react';
import { CombinedError, useMutation } from 'urql';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useSetSecret } from 'src/hooks/secrets/useSetSecret';

vi.mock(import('urql'), async (importOriginal) => ({
    ...(await importOriginal()),
    useMutation: vi.fn(),
}));

const NAME = 'acmeCo/team/api-key';
const VALUE = 'super-secret-value';
const DOCUMENT = { name: NAME, sops: { lastmodified: '2026-10-23' } };
const RESULT = {
    changed: true,
    secret: { catalogName: NAME, secretId: '166f8c1993053400' },
};

// `.env.test` sets VITE_ENCRYPTION_URL to http://example.com/encryption
const ENCRYPT_URL =
    'http://example.com/secret/encrypt?name=acmeCo%2Fteam%2Fapi-key';

const setSecret = vi.fn();
const fetchMock = vi.fn();

const renderSetSecret = () => renderHook(() => useSetSecret()).result.current;

describe('useSetSecret', () => {
    beforeEach(() => {
        setSecret.mockReset();
        setSecret.mockResolvedValue({ data: { setSecret: RESULT } });
        vi.mocked(useMutation).mockReturnValue([{} as never, setSecret]);

        fetchMock.mockReset();
        fetchMock.mockImplementation(
            async () => new Response(JSON.stringify(DOCUMENT))
        );
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('should encrypt the value under the secret name, then save the document', async () => {
        const saveSecret = renderSetSecret();

        await expect(saveSecret(NAME, VALUE)).resolves.toEqual(RESULT);

        expect(fetchMock).toHaveBeenCalledWith(ENCRYPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(VALUE),
        });
        expect(setSecret).toHaveBeenCalledWith({
            catalogName: NAME,
            document: DOCUMENT,
        });
    });

    test('should send the value only to the encryption route', async () => {
        const saveSecret = renderSetSecret();

        await saveSecret(NAME, VALUE);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(setSecret.mock.calls)).not.toContain(VALUE);
    });

    test('should throw the encryption error without saving', async () => {
        fetchMock.mockImplementation(
            async () => new Response('value too large', { status: 413 })
        );
        const saveSecret = renderSetSecret();

        await expect(saveSecret(NAME, VALUE)).rejects.toThrow(
            'value too large'
        );
        expect(setSecret).not.toHaveBeenCalled();
    });

    test('should fall back to the status when the encryption error has no body', async () => {
        fetchMock.mockImplementation(
            async () => new Response(null, { status: 502 })
        );
        const saveSecret = renderSetSecret();

        await expect(saveSecret(NAME, VALUE)).rejects.toThrow(
            'Encryption failed with status 502'
        );
        expect(setSecret).not.toHaveBeenCalled();
    });

    test('should throw the setSecret error', async () => {
        const error = new CombinedError({
            graphQLErrors: [{ message: 'document is stale' }],
        });
        setSecret.mockResolvedValue({ error });
        const saveSecret = renderSetSecret();

        await expect(saveSecret(NAME, VALUE)).rejects.toBe(error);
    });
});
