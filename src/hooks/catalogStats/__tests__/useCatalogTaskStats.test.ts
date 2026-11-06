import type { CatalogTaskStatsFieldsFragment } from 'src/gql-types/graphql';

import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import { DataGrains } from 'src/components/graphs/types';
import { useCatalogTaskStats } from 'src/hooks/catalogStats/useCatalogTaskStats';

vi.mock('src/api/gql/usePollingQuery', () => ({
    usePollingQuery: vi.fn(),
}));

const mockedUsePollingQuery = vi.mocked(usePollingQuery);

const RANGE = { grain: DataGrains.hourly, amount: 48 };

const statsNode = (
    catalogName: string,
    timestamp: string
): CatalogTaskStatsFieldsFragment =>
    ({
        catalogName,
        grain: 'HOURLY',
        timestamp,
        statsSummary: { lastPublishedAt: null },
        taskStats: {
            capture: [],
            materialize: [
                {
                    collection: 'acmeCo/orders',
                    bytesBehind: '1000',
                    lastSourcePublishedAt: null,
                    right: null,
                },
            ],
        },
    }) as unknown as CatalogTaskStatsFieldsFragment;

const batchOf = (...nodes: CatalogTaskStatsFieldsFragment[]) => ({
    edges: nodes.map((node) => ({ node })),
});

const respond = (result: Partial<ReturnType<typeof usePollingQuery>>) =>
    mockedUsePollingQuery.mockReturnValue({
        data: undefined,
        error: undefined,
        fetching: false,
        updatedAt: null,
        ...result,
    } as ReturnType<typeof usePollingQuery>);

const lastCall = () => mockedUsePollingQuery.mock.calls.at(-1)![0];

describe('useCatalogTaskStats', () => {
    beforeEach(() => {
        mockedUsePollingQuery.mockReset();
    });

    test('queries each name once, ignoring blanks and duplicates', () => {
        respond({});

        renderHook(() =>
            useCatalogTaskStats(['acmeCo/a', '', 'acmeCo/a', 'acmeCo/b'], RANGE)
        );

        const { pause, variables } = lastCall();
        expect(pause).toBe(false);
        expect(variables).toEqual({
            vars_0: expect.objectContaining({
                names: ['acmeCo/a', 'acmeCo/b'],
                grain: 'HOURLY',
            }),
        });
    });

    test('pauses when there are no names', () => {
        respond({});

        renderHook(() => useCatalogTaskStats(['', ''], RANGE));

        expect(lastCall().pause).toBe(true);
    });

    test('splits more than 100 names into batches of one query', () => {
        respond({});

        const names = Array.from(
            { length: 150 },
            (_, index) => `acmeCo/c${index}`
        );
        renderHook(() => useCatalogTaskStats(names, RANGE));

        const { query, variables } = lastCall();
        expect(variables?.vars_0.names).toHaveLength(100);
        expect(variables?.vars_1.names).toHaveLength(50);

        const operation = print(query as any);
        expect(operation).toContain('batch_0: catalogStats(by: $vars_0)');
        expect(operation).toContain('batch_1: catalogStats(by: $vars_1)');
    });

    test('flattens every batch into one list of stats', () => {
        respond({
            data: {
                batch_0: batchOf(statsNode('acmeCo/a', '2026-11-11T15:00:00Z')),
                batch_1: batchOf(statsNode('acmeCo/b', '2026-11-11T16:00:00Z')),
            },
        });

        const { result } = renderHook(() =>
            useCatalogTaskStats(['acmeCo/a', 'acmeCo/b'], RANGE)
        );

        expect(result.current.data).toEqual([
            expect.objectContaining({
                catalogName: 'acmeCo/a',
                grain: DataGrains.hourly,
                timestamp: Date.parse('2026-11-11T15:00:00Z') / 1000,
                taskStats: expect.objectContaining({
                    materialize: [
                        expect.objectContaining({ bytesBehind: BigInt(1000) }),
                    ],
                }),
            }),
            expect.objectContaining({ catalogName: 'acmeCo/b' }),
        ]);
    });

    // A failed batch comes back null alongside the error
    test('keeps the batches that succeeded when one fails', () => {
        const error = new Error('batch failed');
        respond({
            data: {
                batch_0: batchOf(statsNode('acmeCo/a', '2026-11-11T15:00:00Z')),
                batch_1: null,
            },
            error: error as any,
        });

        const { result } = renderHook(() =>
            useCatalogTaskStats(['acmeCo/a', 'acmeCo/b'], RANGE)
        );

        expect(result.current.data).toHaveLength(1);
        expect(result.current.error).toBe(error);
    });

    test('keeps the last result while the window reloads, flagged stale', () => {
        respond({
            data: {
                batch_0: batchOf(statsNode('acmeCo/a', '2026-11-11T15:00:00Z')),
            },
        });
        const { result, rerender } = renderHook(() =>
            useCatalogTaskStats('acmeCo/a', RANGE)
        );
        const loaded = result.current.data;

        respond({ fetching: true });
        rerender();

        expect(result.current.stale).toBe(true);
        expect(result.current.data).toBe(loaded);
    });

    test('does not show one set of names the result of another', () => {
        respond({
            data: {
                batch_0: batchOf(statsNode('acmeCo/a', '2026-11-11T15:00:00Z')),
            },
        });
        const { result, rerender } = renderHook(
            ({ names }) => useCatalogTaskStats(names, RANGE),
            { initialProps: { names: 'acmeCo/a' } }
        );

        respond({ fetching: true });
        rerender({ names: 'acmeCo/b' });

        expect(result.current.stale).toBe(false);
        expect(result.current.data).toBeUndefined();
    });
});
