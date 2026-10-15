import type { AnyVariables, UseQueryArgs } from 'urql';

import { useEffect, useRef, useState } from 'react';

import { isEqual } from 'lodash';
import { DateTime } from 'luxon';
import { useInterval } from 'react-use';
import { useQuery } from 'urql';

import { usePageVisibility } from 'src/hooks/usePageVisibility';

type UsePollingQueryArgs<
    Variables extends AnyVariables = AnyVariables,
    Data = any,
> = UseQueryArgs<Variables, Data> & {
    pollingIntervalMs?: number;
};

/**
 * Executes the given query on the specified interval. Does not run
 * if `pollingIntervalMs` is falsey. Polling is disabled while the
 * page is not visible.
 */
export function usePollingQuery<
    Data = any,
    Variables extends AnyVariables = AnyVariables,
>(args: UsePollingQueryArgs<Variables, Data>) {
    const pageIsVisible = usePageVisibility();
    const pageWasVisible = useRef(pageIsVisible);

    const { pause, pollingIntervalMs } = args;
    const requestPolicy = args.requestPolicy ?? 'cache-first';
    const [{ data, error, fetching, operation }, reexecuteQuery] = useQuery({
        ...args,
        requestPolicy,
    });

    const canRefetch = !fetching && !pause && !!pollingIntervalMs;
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

        if (pageBecameVisible && canRefetch) {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }
    }, [canRefetch, pageIsVisible, reexecuteQuery]);

    // Execute the query on the specified interval. Does not run if
    // `pollingIntervalMs` is falsey or if the page is not visible.
    useInterval(() => {
        if (canRefetch && pageIsVisible) {
            reexecuteQuery({ requestPolicy: 'network-only' });
        }
    }, pollingIntervalMs || null);

    // If the variables changed, that will retrigger a fetch, so return
    // no data with fetching = true to indicate that and force downstream
    // consumers to handle the loading state. However, if paused, urql does
    // not return an operation, so we want to defer to urql's behavior.
    const varsChanged = !isEqual(operation?.variables, args.variables);
    if (!pause && varsChanged) {
        return { fetching: true, updatedAt };
    }

    return { data, fetching, error, updatedAt };
}
