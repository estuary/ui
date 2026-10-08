import type * as Urql from 'urql';

import { renderHook, waitFor } from '@testing-library/react';
import { parse } from 'graphql';
import { createRequest, makeOperation, useQuery } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAllPages } from 'src/api/gql/useAllPages';

vi.mock('urql', async (importOriginal) => ({
    ...(await importOriginal<typeof Urql>()),
    useQuery: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);
const QUERY = parse(`
    query Items($after: String) {
        items(after: $after) {
            edges { node }
            pageInfo { hasNextPage endCursor }
        }
    }
`);

const makePage = (nodes: string[], endCursor?: string) => ({
    items: {
        edges: nodes.map((node) => ({ node })),
        pageInfo: { hasNextPage: Boolean(endCursor), endCursor },
    },
});

const makeResult = (
    data: ReturnType<typeof makePage>,
    variables?: Urql.AnyVariables
) => ({
    fetching: false,
    stale: false,
    hasNext: false,
    data,
    operation: makeOperation('query', createRequest(QUERY, variables), {
        url: '/graphql',
        requestPolicy: 'cache-first',
    }),
});

const options = {
    getConnection: (data: ReturnType<typeof makePage>) => data.items,
    transform: (node: string) => node,
};

describe('useAllPages', () => {
    beforeEach(() => {
        mockedUseQuery.mockReset();
    });

    test.each([
        { change: 'same size', nodes: ['updated-a', 'updated-b'] },
        { change: 'larger', nodes: ['updated-a', 'updated-b', 'updated-c'] },
        { change: 'smaller', nodes: ['updated-a'] },
        { change: 'empty', nodes: [] },
    ])('replaces a refetched final page that is $change', async ({ nodes }) => {
        const firstPage = makePage(['first-a', 'first-b'], 'next');
        let lastPage = makePage(['second-a', 'second-b']);
        mockedUseQuery.mockImplementation(
            ({ variables }) =>
                [
                    makeResult(
                        variables?.after ? lastPage : firstPage,
                        variables
                    ),
                    vi.fn(),
                ] as ReturnType<typeof useQuery>
        );
        const { result, rerender } = renderHook(() =>
            useAllPages(QUERY, options)
        );
        await waitFor(() =>
            expect(result.current.data).toEqual([
                'first-a',
                'first-b',
                'second-a',
                'second-b',
            ])
        );
        lastPage = makePage(nodes);
        rerender();
        await waitFor(() =>
            expect(result.current.data).toEqual([
                'first-a',
                'first-b',
                ...nodes,
            ])
        );
    });

    test('ignores retained data from the previous cursor', async () => {
        const firstPage = makePage(['first'], 'next');
        const lastPage = makePage(['second']);
        let retainFirstPage = true;
        mockedUseQuery.mockImplementation(({ variables }) => {
            const useFirstPage = !variables?.after || retainFirstPage;
            return [
                makeResult(useFirstPage ? firstPage : lastPage, {
                    ...variables,
                    after: useFirstPage ? undefined : variables?.after,
                }),
                vi.fn(),
            ] as ReturnType<typeof useQuery>;
        });
        const { result, rerender } = renderHook(() =>
            useAllPages(QUERY, options)
        );
        await waitFor(() =>
            expect(mockedUseQuery).toHaveBeenLastCalledWith(
                expect.objectContaining({ variables: { after: 'next' } })
            )
        );
        expect(result.current.loading).toBe(true);
        expect(result.current.data).toEqual([]);

        retainFirstPage = false;
        rerender();
        await waitFor(() =>
            expect(result.current.data).toEqual(['first', 'second'])
        );
    });

    test('restarts from the first page when its reset key changes', async () => {
        let generation = 1;
        const requestedCursors: (string | undefined)[] = [];
        const pageData = new Map<string, ReturnType<typeof makePage>>();

        function getPageData(after: string | undefined) {
            const key = `${generation}:${after ?? 'first-page'}`;
            let data = pageData.get(key);

            if (!data) {
                data = after
                    ? makePage([`${generation}-second`])
                    : makePage([`${generation}-first`], 'next-page');
                pageData.set(key, data);
            }

            return data;
        }

        mockedUseQuery.mockImplementation(({ variables }) => {
            const after = variables?.after as string | undefined;
            requestedCursors.push(after);

            return [
                makeResult(getPageData(after), variables),
                vi.fn(),
            ] as ReturnType<typeof useQuery>;
        });

        const { result, rerender } = renderHook(
            ({ resetKey }) => useAllPages(QUERY, { ...options, resetKey }),
            { initialProps: { resetKey: 0 } }
        );

        await waitFor(() => {
            expect(result.current.data).toEqual(['1-first', '1-second']);
        });

        generation = 2;
        requestedCursors.length = 0;
        rerender({ resetKey: 1 });

        await waitFor(() => {
            expect(result.current.data).toEqual(['2-first', '2-second']);
        });
        expect(requestedCursors).toContain(undefined);
    });
});
