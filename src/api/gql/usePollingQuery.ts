import type { AnyVariables, UseQueryArgs } from 'urql';

import { useEffect, useRef, useState } from 'react';

import { isEqual } from 'lodash';
import { DateTime } from 'luxon';
import { useInterval } from 'react-use';
import { useQuery } from 'urql';

type UsePollingQueryArgs<
    Variables extends AnyVariables = AnyVariables,
    Data = any,
> = UseQueryArgs<Variables, Data> & {
    pollingIntervalMs?: number;
};

export function usePollingQuery<
    Data = any,
    Variables extends AnyVariables = AnyVariables,
>(args: UsePollingQueryArgs<Variables, Data>) {
    const { pause, pollingIntervalMs } = args;
    const requestPolicy = args.requestPolicy ?? 'cache-first';
    const [{ data, error, fetching, operation }, reexecuteQuery] = useQuery({
        ...args,
        requestPolicy,
    });

    // keep track of the last successful fetch time
    const [updatedAt, setUpdatedAt] = useState<DateTime | null>(null);
    const wasFetching = useRef(false);

    // update the `updatedAt` time on sucessful fetch
    useEffect(() => {
        if (wasFetching.current && !fetching && !error) {
            setUpdatedAt(DateTime.now());
        }
        wasFetching.current = fetching;
    }, [fetching, error]);

    // interval does not run if `pollingIntervalMs` is falsey
    useInterval(() => {
        if (fetching || pause) {
            return;
        }

        reexecuteQuery({ requestPolicy: 'network-only' });
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
