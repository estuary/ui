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
});
