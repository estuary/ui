import type { Connection } from 'src/api/gql/useAllPages';

import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useAllPages } from 'src/api/gql/useAllPages';

vi.mock('urql', () => ({
    useQuery: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);

describe('useAllPages', () => {
    beforeEach(() => {
        mockedUseQuery.mockReset();
    });

    test('restarts from the first page when its reset key changes', async () => {
        let generation = 1;
        const requestedCursors: (string | undefined)[] = [];
        const pageData = new Map<string, { items: Connection<string> }>();

        function getPageData(after: string | undefined) {
            const key = `${generation}:${after ?? 'first-page'}`;
            let data = pageData.get(key);

            if (!data) {
                data = {
                    items: after
                        ? {
                              edges: [{ node: `${generation}-second` }],
                              pageInfo: { hasNextPage: false },
                          }
                        : {
                              edges: [{ node: `${generation}-first` }],
                              pageInfo: {
                                  hasNextPage: true,
                                  endCursor: 'next-page',
                              },
                          },
                };
                pageData.set(key, data);
            }

            return data;
        }

        mockedUseQuery.mockImplementation(({ variables }) => {
            const after = variables?.after as string | undefined;
            requestedCursors.push(after);

            return [
                {
                    fetching: false,
                    stale: false,
                    hasNext: false,
                    data: getPageData(after),
                },
                vi.fn(),
            ] as ReturnType<typeof useQuery>;
        });

        const { result, rerender } = renderHook(
            ({ resetKey }) =>
                useAllPages({} as never, {
                    getConnection: (data: {
                        items: {
                            edges: { node: string }[];
                            pageInfo: {
                                hasNextPage: boolean;
                                endCursor?: string;
                            };
                        };
                    }) => data.items,
                    transform: (node: string) => node,
                    resetKey,
                }),
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

    describe('when URQL delivers a page again', () => {
        type PageData = { items: Connection<string> };

        // Serves pages from a mutable map keyed by cursor. Replacing an entry
        // and rerendering simulates URQL re-publishing that page (TTL refetch,
        // graphcache invalidation) without the cursor changing.
        function setupPages(initial: Record<string, Connection<string>>) {
            const pages = new Map<string, PageData>(
                Object.entries(initial).map(([cursor, items]) => [
                    cursor,
                    { items },
                ])
            );

            mockedUseQuery.mockImplementation(({ variables }) => {
                const after = (variables?.after as string | undefined) ?? '';

                return [
                    {
                        fetching: false,
                        stale: false,
                        hasNext: false,
                        data: pages.get(after),
                    },
                    vi.fn(),
                ] as ReturnType<typeof useQuery>;
            });

            const hook = renderHook(() =>
                useAllPages({} as never, {
                    getConnection: (data: PageData) => data.items,
                    transform: (node: string) => node,
                })
            );

            const redeliver = (cursor: string, items: Connection<string>) => {
                pages.set(cursor, { items });
                hook.rerender();
            };

            return { ...hook, redeliver };
        }

        const page = (
            nodes: string[],
            endCursor?: string
        ): Connection<string> => ({
            edges: nodes.map((node) => ({ node })),
            pageInfo: { hasNextPage: Boolean(endCursor), endCursor },
        });

        test('does not duplicate items when the last page is re-published', async () => {
            const { result, redeliver } = setupPages({
                '': page(['a', 'b'], 'cursor-2'),
                'cursor-2': page(['c', 'd']),
            });

            await waitFor(() => {
                expect(result.current.data).toEqual(['a', 'b', 'c', 'd']);
            });

            redeliver('cursor-2', page(['c', 'd']));

            await waitFor(() => {
                expect(result.current.data).toEqual(['a', 'b', 'c', 'd']);
            });
        });

        test('reflects a re-published last page with new contents', async () => {
            const { result, redeliver } = setupPages({
                '': page(['a', 'b'], 'cursor-2'),
                'cursor-2': page(['c']),
            });

            await waitFor(() => {
                expect(result.current.data).toEqual(['a', 'b', 'c']);
            });

            redeliver('cursor-2', page(['c', 'new']));

            await waitFor(() => {
                expect(result.current.data).toEqual(['a', 'b', 'c', 'new']);
            });
        });
    });
});
