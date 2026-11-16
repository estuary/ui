import type { AnyVariables, UseQueryArgs } from 'urql';

import { useEffect, useRef, useState } from 'react';

import { isEqual } from 'lodash';
import { DateTime } from 'luxon';
import { useInterval } from 'react-use';
import { useClient, useQuery } from 'urql';

import { usePageVisibility } from 'src/hooks/usePageVisibility';

// Without a polling interval, returning to the tab still refetches, but only
// once the data is at least this old
const MIN_STALE_ON_VISIBLE_MS = 5000;

type UsePollingQueryArgs<
    Variables extends AnyVariables = AnyVariables,
    Data = any,
> = UseQueryArgs<Variables, Data> & {
    pollingIntervalMs?:
        | number
        | ((data: Data | undefined) => number | undefined);
    keepDataOnError?: boolean;
};

/**
 * Executes the given query on the specified interval. Does not poll
 * if `pollingIntervalMs` is falsey. Polling is disabled while the
 * page is not visible. Either way, the query refetches when a hidden
 * tab becomes visible again and the data is stale.
 *
 * `pollingIntervalMs` may instead be a function of the data this hook
 * returns, so a caller can poll only while that data shows work in
 * progress. A falsey result disables polling the same way.
 *
 * With `keepDataOnError`, a fetch that fails without data reads the current
 * cached result, including changes from mutations. A cache miss stays empty.
 * This read can clear the query error, but never makes a network request.
 * The interval function sees the cached data too.
 */
export function usePollingQuery<
    Data = any,
    Variables extends AnyVariables = AnyVariables,
>(args: UsePollingQueryArgs<Variables, Data>) {
    const client = useClient();
    const pageIsVisible = usePageVisibility();
    const pageWasVisible = useRef(pageIsVisible);

    const requestPolicy = args.requestPolicy ?? 'cache-first';
    const [{ data, error, fetching, operation }, reexecuteQuery] = useQuery({
        ...args,
        requestPolicy,
    });

    const { pause } = args;

    // If the variables changed, that will retrigger a fetch, so return
    // no data with fetching = true to indicate that and force downstream
    // consumers to handle the loading state. However, if paused, urql does
    // not return an operation, so we want to defer to urql's behavior.
    const varsChanged = !isEqual(operation?.variables, args.variables);
    const withholdData = !pause && varsChanged;

    const returnedData =
        args.keepDataOnError && !pause && !withholdData && error && !data
            ? client.readQuery(args.query, args.variables, {
                  ...args.context,
                  requestPolicy: 'cache-only',
              })?.data
            : data;

    // Treat a polling interval of 0 the same as null, which disables the
    // polling instead of looping indefinitely.
    const pollingIntervalMs =
        (typeof args.pollingIntervalMs === 'function'
            ? args.pollingIntervalMs(withholdData ? undefined : returnedData)
            : args.pollingIntervalMs) || null;

    const canRefetch = !fetching && !pause;
    const wasFetching = useRef(false);

    // Keep track of the last successful fetch time.
    const [updatedAt, setUpdatedAt] = useState<DateTime | null>(null);
    useEffect(() => {
        if (wasFetching.current && !fetching && !error) {
            setUpdatedAt(DateTime.now());
        }
        wasFetching.current = fetching;
    }, [fetching, error]);

    // Refetch as soon as a hidden tab becomes visible again,
    // rather than waiting up to a full poll interval.
    useEffect(() => {
        const pageBecameVisible = pageIsVisible && !pageWasVisible.current;
        pageWasVisible.current = pageIsVisible;

        // Skip refetching if the data is still fresh, to avoid unnecessary calls
        // if the user flips quickly between the page being visible and hidden.
        const isStale =
            !updatedAt ||
            DateTime.now().diff(updatedAt).toMillis() >=
                (pollingIntervalMs ?? MIN_STALE_ON_VISIBLE_MS);

        if (pageBecameVisible && canRefetch && isStale) {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }
    }, [
        canRefetch,
        pageIsVisible,
        pollingIntervalMs,
        updatedAt,
        reexecuteQuery,
    ]);

    // Execute the query on the specified interval. Does not run if
    // `pollingIntervalMs` is falsey or if the page is not visible.
    // The timer is reset when the page becomes visible to avoid it
    // potentially ticking right after the refetch above.
    const intervalMs = pageIsVisible ? pollingIntervalMs : null;
    useInterval(() => {
        if (canRefetch) {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }
    }, intervalMs);

    if (withholdData) {
        return { fetching: true, updatedAt };
    }

    return { data: returnedData, fetching, error, updatedAt };
}
