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
    operationVariables?: unknown;
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

    mockedUseQuery.mockImplementation(() => {
        const { operationVariables, ...result } = queryState;

        return [
            {
                stale: false,
                hasNext: false,
                ...result,
                operation:
                    operationVariables === undefined
                        ? undefined
                        : { variables: operationVariables },
            },
            reexecuteQuery,
        ] as unknown as ReturnType<typeof useQuery>;
    });

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

// updatedAt is stamped on the fetching true -> false edge, so a test has to
// walk the hook through both renders rather than just flipping a flag.
function completeFetch(rerender: () => void, settled: QueryState = {}) {
    act(() => {
        queryState.fetching = true;
        rerender();
    });

    act(() => {
        Object.assign(queryState, { fetching: false, ...settled });
        rerender();
    });
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
        mockQuery({
            data: { hello: 'world' },
            fetching: true,
            operationVariables: { name: 'acmeCo/' },
        });

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

    test('treats a zero interval as disabled', () => {
        mockQuery();
        renderPollingQuery({ pollingIntervalMs: 0 } as Partial<UseQueryArgs>);
        // expect no timer is registered
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

    describe('while paused', () => {
        test('does not report fetching, even with variables set', () => {
            mockQuery();

            const { result } = renderPollingQuery({
                pause: true,
                variables: { by: { names: [] } },
            });

            expect(result.current.fetching).toBe(false);
        });

        test('passes through the latest result', () => {
            mockQuery({ data: { hello: 'world' } });

            const { result } = renderPollingQuery({
                pause: true,
                variables: { by: { names: [] } },
            });

            expect(result.current.data).toEqual({ hello: 'world' });
        });

        test('withholds data again once unpaused with new variables', () => {
            mockQuery({
                data: { hello: 'stale' },
                operationVariables: { name: 'acmeCo/' },
            });

            const { result, rerender } = renderHook(
                ({ paused }: { paused: boolean }) =>
                    usePollingQuery({
                        query: QUERY,
                        pause: paused,
                        variables: { name: 'bravoCo/' },
                    } as UseQueryArgs),
                { initialProps: { paused: true } }
            );

            expect(result.current.data).toEqual({ hello: 'stale' });

            act(() => {
                rerender({ paused: false });
            });

            expect(result.current.data).toBeUndefined();
            expect(result.current.fetching).toBe(true);
        });
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

    describe('when the variables change', () => {
        test('withholds data until the operation catches up', () => {
            mockQuery({
                data: { hello: 'stale' },
                operationVariables: { name: 'acmeCo/' },
            });

            const { result } = renderPollingQuery({
                variables: { name: 'bravoCo/' },
            });

            expect(result.current.data).toBeUndefined();
            expect(result.current.fetching).toBe(true);
        });

        test('withholds a stale error too', () => {
            mockQuery({
                error: new Error('stale failure'),
                operationVariables: { name: 'acmeCo/' },
            });

            const { result } = renderPollingQuery({
                variables: { name: 'bravoCo/' },
            });

            expect(result.current.error).toBeUndefined();
        });

        test('surfaces data once the operation matches again', () => {
            mockQuery({
                data: { hello: 'stale' },
                operationVariables: { name: 'acmeCo/' },
            });

            const { result, rerender } = renderPollingQuery({
                variables: { name: 'bravoCo/' },
            });
            expect(result.current.data).toBeUndefined();

            act(() => {
                queryState.data = { hello: 'fresh' };
                queryState.operationVariables = { name: 'bravoCo/' };
                rerender();
            });

            expect(result.current.data).toEqual({ hello: 'fresh' });
        });

        // The comparison has to be structural: urql hands back its own
        // variables object, never the caller's reference.
        test('compares variables structurally, not by reference', () => {
            mockQuery({
                data: { hello: 'world' },
                operationVariables: {
                    by: { names: ['acmeCo/'], grain: 'HOURLY' },
                },
            });

            const { result } = renderPollingQuery({
                variables: { by: { names: ['acmeCo/'], grain: 'HOURLY' } },
            });

            expect(result.current.data).toEqual({ hello: 'world' });
            expect(result.current.fetching).toBe(false);
        });

        test('keeps the last updated time across the change', () => {
            mockQuery({ operationVariables: { name: 'acmeCo/' } });

            const { result, rerender } = renderHook(
                ({ name }: { name: string }) =>
                    usePollingQuery({
                        query: QUERY,
                        variables: { name },
                    } as UseQueryArgs),
                { initialProps: { name: 'acmeCo/' } }
            );

            completeFetch(() => rerender({ name: 'acmeCo/' }));

            const stamped = result.current.updatedAt;
            expect(stamped).not.toBeNull();

            // Point the hook at new variables; the operation still reports the
            // old ones until urql re-runs it.
            act(() => {
                rerender({ name: 'bravoCo/' });
            });

            expect(result.current.data).toBeUndefined();
            expect(result.current.fetching).toBe(true);
            expect(+result.current.updatedAt!).toBe(+stamped!);
        });
    });

    test('has no updated time before the first fetch settles', () => {
        mockQuery({ fetching: true });
        const { result } = renderPollingQuery();
        expect(result.current.updatedAt).toBeNull();
    });

    test('stamps updatedAt once a fetch settles', () => {
        mockQuery();

        const { result, rerender } = renderPollingQuery();
        expect(result.current.updatedAt).toBeNull();

        completeFetch(rerender, { data: { hello: 'world' } });

        expect(result.current.updatedAt).not.toBeNull();
        expect(+result.current.updatedAt!).toBe(Date.now());
    });

    test('leaves updatedAt alone when a fetch settles with an error', () => {
        mockQuery();

        const { result, rerender } = renderPollingQuery();

        completeFetch(rerender, { error: new Error('nope') });

        expect(result.current.updatedAt).toBeNull();
    });

    test('advances updatedAt on each successful fetch', () => {
        mockQuery();

        const { result, rerender } = renderPollingQuery();

        completeFetch(rerender);
        const first = result.current.updatedAt;

        advance(INTERVAL_MS);
        completeFetch(rerender);

        expect(+result.current.updatedAt!).toBeGreaterThan(+first!);
    });

    // The interval only re-executes the query; the stamp belongs to the fetch
    // that follows. A tick on its own must not move it.
    test('does not stamp updatedAt for a poll tick alone', () => {
        mockQuery();

        const { result } = renderPollingQuery({
            pollingIntervalMs: INTERVAL_MS,
        } as Partial<UseQueryArgs>);

        advance(INTERVAL_MS);

        expect(reexecuteQuery).toHaveBeenCalledTimes(1);
        expect(result.current.updatedAt).toBeNull();
    });

    test('leaves updatedAt unset while the query is paused', () => {
        mockQuery();

        const { result } = renderPollingQuery({
            pause: true,
            pollingIntervalMs: INTERVAL_MS,
        } as Partial<UseQueryArgs>);

        advance(INTERVAL_MS * 3);

        expect(result.current.updatedAt).toBeNull();
    });
});
