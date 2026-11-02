import { renderHook } from '@testing-library/react';
import { CombinedError, useQuery } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useCanEditSecret } from 'src/hooks/secrets/useCanEditSecret';

vi.mock(import('urql'), async (importOriginal) => ({
    ...(await importOriginal()),
    useQuery: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);

function mockPrefixes(
    nodes: { prefix: string; capabilities: string[] }[] | undefined,
    state: { fetching?: boolean; error?: CombinedError } = {}
) {
    mockedUseQuery.mockReturnValue([
        {
            data: nodes
                ? { prefixes: { edges: nodes.map((node) => ({ node })) } }
                : undefined,
            fetching: state.fetching ?? false,
            error: state.error,
            stale: false,
            hasNext: false,
        },
        vi.fn(),
    ] as unknown as ReturnType<typeof useQuery>);
}

const queryArgs = () => mockedUseQuery.mock.calls[0][0];

describe('useCanEditSecret', () => {
    beforeEach(() => {
        mockedUseQuery.mockReset();
    });

    test('should query every prefix the name sits under', () => {
        mockPrefixes([]);
        renderHook(() => useCanEditSecret('acmeCo/team/api-key'));

        expect(queryArgs()).toEqual(
            expect.objectContaining({
                variables: { prefixes: ['acmeCo/', 'acmeCo/team/'] },
                requestPolicy: 'network-only', // should not rely on cached values
                pause: false,
            })
        );
    });

    test('should allow editing when any covering prefix grants EditSecret', () => {
        mockPrefixes([
            { prefix: 'acmeCo/', capabilities: ['CatalogRead'] },
            {
                prefix: 'acmeCo/team/',
                capabilities: ['ViewSecret', 'EditSecret'],
            },
        ]);
        const { result } = renderHook(() =>
            useCanEditSecret('acmeCo/team/api-key')
        );

        expect(result.current.canEdit).toBe(true);
    });

    test('should not allow editing without EditSecret capability', () => {
        mockPrefixes([
            { prefix: 'acmeCo/', capabilities: ['ViewSecret', 'SpecEdit'] },
        ]);
        const { result } = renderHook(() =>
            useCanEditSecret('acmeCo/team/api-key')
        );

        expect(result.current.canEdit).toBe(false);
    });

    test('should not allow editing when no prefix is returned', () => {
        mockPrefixes([]);
        const { result } = renderHook(() => useCanEditSecret('acmeCo/api-key'));

        expect(result.current.canEdit).toBe(false);
    });

    test('should not allow editing before the query is done fetching', () => {
        mockPrefixes(undefined, { fetching: true });
        const { result } = renderHook(() => useCanEditSecret('acmeCo/api-key'));

        expect(result.current).toEqual({
            canEdit: false,
            fetching: true,
            error: undefined,
        });
    });

    test('should pass a query error through', () => {
        const error = new CombinedError({
            graphQLErrors: [{ message: 'nope' }],
        });
        mockPrefixes(undefined, { error });
        const { result } = renderHook(() => useCanEditSecret('acmeCo/api-key'));

        expect(result.current.error).toBe(error);
        expect(result.current.canEdit).toBe(false);
    });

    test('should pause for a name with no prefix to check', () => {
        mockPrefixes(undefined);
        renderHook(() => useCanEditSecret('api-key'));

        expect(queryArgs()).toEqual(
            expect.objectContaining({
                variables: { prefixes: [] },
                pause: true,
            })
        );
    });
});
