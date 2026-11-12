import type { CatalogTaskStats } from 'src/api/catalogStats';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DataGrains } from 'src/components/graphs/types';
import { useCatalogTaskStats } from 'src/hooks/catalogStats/useCatalogTaskStats';
import { useMaterializationBacklog } from 'src/hooks/details/useMaterializationBacklog';
import { useEntitiesStore_capabilities_readable } from 'src/stores/Entities/hooks';

vi.mock('src/hooks/catalogStats/useCatalogTaskStats', () => ({
    useCatalogTaskStats: vi.fn(),
}));
vi.mock('src/stores/Entities/hooks', () => ({
    useEntitiesStore_capabilities_readable: vi.fn(),
}));

const mockedTaskStats = vi.mocked(useCatalogTaskStats);
const mockedReadable = vi.mocked(useEntitiesStore_capabilities_readable);

const TASK = 'acmeCo/warehouse';
const OWN = 'acmeCo/orders';
const SHARED = 'otherCo/shipments';

const toSeconds = (iso: string) => Date.parse(iso) / 1000;

// The task's newest hourly row, with a binding per source collection
const taskRow: CatalogTaskStats = {
    catalogName: TASK,
    grain: DataGrains.hourly,
    timestamp: toSeconds('2026-11-11T16:00:00Z'),
    lastPublishedAt: null,
    taskStats: {
        capture: [],
        materialize: [OWN, SHARED].map((collection) => ({
            collection,
            bytesBehind: BigInt(0),
            lastSourcePublishedAt: '2026-11-11T16:00:00Z',
            right: null,
        })),
    },
};

// Each source collection's monthly row, published 10 minutes past the task
const collectionRow = (catalogName: string): CatalogTaskStats => ({
    catalogName,
    grain: DataGrains.monthly,
    timestamp: toSeconds('2026-11-01T00:00:00Z'),
    lastPublishedAt: '2026-11-11T16:10:00Z',
    taskStats: null,
});

// Answers the backlog query with the task's row, and the time-lag query with
// a row for each collection it's asked for
const respondWithStats = () =>
    mockedTaskStats.mockImplementation((names) =>
        names === TASK
            ? {
                  data: [taskRow],
                  error: undefined,
                  fetching: false,
                  stale: false,
              }
            : {
                  data: (names as string[]).map(collectionRow),
                  error: undefined,
                  fetching: false,
                  stale: false,
              }
    );

const timeLagNames = () =>
    mockedTaskStats.mock.calls.filter(([names]) => names !== TASK).at(-1)![0];

const render = () =>
    renderHook(() => useMaterializationBacklog(TASK, [OWN, SHARED])).result;

describe('useMaterializationBacklog', () => {
    beforeEach(() => {
        mockedTaskStats.mockReset();
        respondWithStats();
    });

    test('asks for the time lag of every readable source collection', () => {
        mockedReadable.mockReturnValue(['acmeCo/', 'otherCo/']);

        const result = render();

        expect(timeLagNames()).toEqual([OWN, SHARED]);
        expect(result.current.timeLag?.bindings).toHaveLength(2);
    });

    // A shared collection a read-only user can't reach would otherwise fail the
    // whole request, leaving every binding without a time lag
    test('leaves out source collections the user cannot read', () => {
        mockedReadable.mockReturnValue(['acmeCo/']);

        const result = render();

        expect(timeLagNames()).toEqual([OWN]);
        expect(result.current.timeLag).toEqual({
            bindings: [{ collectionName: OWN, seconds: 600 }],
            seconds: 600,
        });
        expect(result.current.timeLagLoading).toBe(false);
    });

    test('does not wait on the time lag when no source collection is readable', () => {
        mockedReadable.mockReturnValue(['someoneElse/']);
        // The query is paused without names, so it never returns data
        mockedTaskStats.mockImplementation((names) =>
            names === TASK
                ? {
                      data: [taskRow],
                      error: undefined,
                      fetching: false,
                      stale: false,
                  }
                : {
                      data: undefined,
                      error: undefined,
                      fetching: false,
                      stale: false,
                  }
        );

        const result = render();

        expect(timeLagNames()).toEqual([]);
        expect(result.current.timeLag).toBeNull();
        expect(result.current.timeLagLoading).toBe(false);
        // The backlog itself still shows
        expect(result.current.backlog?.bindings).toHaveLength(2);
    });
});
