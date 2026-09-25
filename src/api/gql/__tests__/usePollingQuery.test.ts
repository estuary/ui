import type { UseQueryArgs } from 'urql';

import { act, renderHook } from '@testing-library/react';
import { useQuery } from 'urql';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { usePollingQuery } from 'src/api/gql/usePollingQuery';

vi.mock('urql', () => ({
    useQuery: vi.fn(),
}));

const mockedUseQuery = vi.mocked(useQuery);

const QUERY = {} as never;
const INTERVAL_MS = 15000;

interface QueryState {
    data?: unknown;
    error?: unknown;
    fetching?: boolean;
}

let queryState: QueryState;
let reexecuteQuery: ReturnType<typeof vi.fn>;

// Stands in for urql's tuple. `queryState` stays mutable so a test can settle
// an in-flight fetch without swapping out the reexecute spy it asserts on.
function mockQuery(state: QueryState = {}) {
    queryState = {
        data: undefined,
        error: undefined,
        fetching: false,
        ...state,
    };
    reexecuteQuery = vi.fn();

    mockedUseQuery.mockImplementation(
        () =>
            [
                { stale: false, hasNext: false, ...queryState },
                reexecuteQuery,
            ] as unknown as ReturnType<typeof useQuery>
    );

    return reexecuteQuery;
}

function advance(ms: number) {
    act(() => {
        vi.advanceTimersByTime(ms);
    });
}

function renderPollingQuery(args: Partial<UseQueryArgs> = {}) {
    return renderHook(() =>
        usePollingQuery({ query: QUERY, ...args } as UseQueryArgs)
    );
}

describe('usePollingQuery', () => {
    beforeEach(() => {
        mockedUseQuery.mockReset();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('forwards its arguments to useQuery and returns the result', () => {
        mockQuery({ data: { hello: 'world' }, fetching: true });

        const { result } = renderPollingQuery({
            variables: { name: 'acmeCo/' },
            pause: false,
        });

        expect(mockedUseQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                query: QUERY,
                variables: { name: 'acmeCo/' },
                pause: false,
            })
        );
        expect(result.current.data).toEqual({ hello: 'world' });
        expect(result.current.fetching).toBe(true);
    });

    test('re-executes on the interval, keeping the request policy', () => {
        mockQuery();

        renderPollingQuery({
            requestPolicy: 'network-only',
            pollingIntervalMs: INTERVAL_MS,
        } as Partial<UseQueryArgs>);

        expect(reexecuteQuery).not.toHaveBeenCalled();
        advance(INTERVAL_MS);
        expect(reexecuteQuery).toHaveBeenCalledWith({
            requestPolicy: 'network-only',
        });
        advance(INTERVAL_MS);
        expect(reexecuteQuery).toHaveBeenCalledTimes(2);
    });

    test('does not poll when no interval is given', () => {
        mockQuery();
        renderPollingQuery({ requestPolicy: 'network-only' });
        advance(INTERVAL_MS * 10);
        expect(reexecuteQuery).not.toHaveBeenCalled();
    });

    // Asserting no timer is registered, rather than advancing the clock: a
    // zero delay that slipped through would schedule an interval that fires
    // repeatedly at t=0, so advancing by any amount spins forever instead of
    // failing.
    test('treats a zero interval as disabled', () => {
        mockQuery();
        renderPollingQuery({ pollingIntervalMs: 0 } as Partial<UseQueryArgs>);
        expect(vi.getTimerCount()).toBe(0);
    });

    test('skips a tick while a fetch is already in flight', () => {
        mockQuery({ fetching: true });

        renderPollingQuery({
            pollingIntervalMs: INTERVAL_MS,
        } as Partial<UseQueryArgs>);

        advance(INTERVAL_MS);
        expect(reexecuteQuery).not.toHaveBeenCalled();
    });

    test('skips a tick while the query is paused', () => {
        mockQuery();

        renderPollingQuery({
            pause: true,
            pollingIntervalMs: INTERVAL_MS,
        } as Partial<UseQueryArgs>);

        advance(INTERVAL_MS);
        expect(reexecuteQuery).not.toHaveBeenCalled();
    });

    test('resumes polling once an in-flight fetch settles', () => {
        mockQuery({ fetching: true });

        const { rerender } = renderPollingQuery({
            pollingIntervalMs: INTERVAL_MS,
        } as Partial<UseQueryArgs>);

        advance(INTERVAL_MS);
        expect(reexecuteQuery).not.toHaveBeenCalled();

        queryState.fetching = false;
        rerender();

        advance(INTERVAL_MS);
        expect(reexecuteQuery).toHaveBeenCalledTimes(1);
    });

    test('advances updatedAt when a poll fires', () => {
        mockQuery();

        const { result } = renderPollingQuery({
            pollingIntervalMs: INTERVAL_MS,
        } as Partial<UseQueryArgs>);

        const initial = result.current.updatedAt;

        advance(INTERVAL_MS);
        expect(+result.current.updatedAt).toBeGreaterThan(+initial);
    });

    test('holds updatedAt steady while the query is paused', () => {
        mockQuery();

        const { result } = renderPollingQuery({
            pause: true,
            pollingIntervalMs: INTERVAL_MS,
        } as Partial<UseQueryArgs>);

        const initial = result.current.updatedAt;

        advance(INTERVAL_MS * 3);
        expect(+result.current.updatedAt).toBe(+initial);
    });
});
