import { renderHook } from '@testing-library/react';
import { CombinedError, useQuery } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useGetSecret } from 'src/hooks/secrets/useGetSecret';

vi.mock(import('urql'), async (importOriginal) => ({
    ...(await importOriginal()),
    useQuery: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);

const NAME = 'acmeCo/api-key';
const SECRET = { catalogName: NAME, secretId: '166f8c1993053400' };

function mockSecrets(
    nodes: { catalogName: string; secretId: string }[] | undefined,
    state: { fetching?: boolean; error?: CombinedError } = {}
) {
    mockedUseQuery.mockReturnValue([
        {
            data: nodes
                ? { secrets: { edges: nodes.map((node) => ({ node })) } }
                : undefined,
            fetching: state.fetching ?? false,
            error: state.error,
            stale: false,
            hasNext: false,
        },
        vi.fn(),
    ] as unknown as ReturnType<typeof useQuery>);
}

describe('useGetSecret', () => {
    beforeEach(() => {
        mockedUseQuery.mockReset();
    });

    test('should look up the secret by name, exact match', () => {
        mockSecrets([]);
        renderHook(() => useGetSecret(NAME));

        expect(mockedUseQuery.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                variables: { secretName: NAME },
                // should bypass the cache to ensure the latest value
                requestPolicy: 'network-only',
                pause: false,
            })
        );
    });

    test('should return the secret when it is returned', () => {
        mockSecrets([SECRET]);
        const { result } = renderHook(() => useGetSecret(NAME));

        expect(result.current.secret).toEqual(SECRET);
    });

    test('should return null when nothing is returned', () => {
        mockSecrets([]);
        const { result } = renderHook(() => useGetSecret(NAME));

        expect(result.current.secret).toBeNull();
    });

    test('should ignore a returned secret with a different name', () => {
        mockSecrets([{ catalogName: 'acmeCo/other-key', secretId: '1' }]);
        const { result } = renderHook(() => useGetSecret(NAME));

        expect(result.current.secret).toBeNull();
    });

    test('should return null and report fetching before the query returns', () => {
        mockSecrets(undefined, { fetching: true });
        const { result } = renderHook(() => useGetSecret(NAME));

        expect(result.current).toEqual({
            secret: null,
            fetching: true,
            error: undefined,
        });
    });

    test('should pass a query error through', () => {
        const error = new CombinedError({ response: { status: 401 } });
        mockSecrets(undefined, { error });
        const { result } = renderHook(() => useGetSecret(NAME));

        expect(result.current.error).toBe(error);
        expect(result.current.secret).toBeNull();
    });

    test('should pause when secretName is empty', () => {
        mockSecrets(undefined);
        renderHook(() => useGetSecret(''));

        expect(mockedUseQuery.mock.calls[0][0].pause).toBe(true);
    });
});
