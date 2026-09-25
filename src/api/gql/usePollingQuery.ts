import type { AnyVariables, UseQueryArgs } from 'urql';

import { useState } from 'react';

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
    const { requestPolicy, pause, pollingIntervalMs } = args;
    const [{ data, error, fetching }, reexecuteQuery] = useQuery(args);
    const [updatedAt, setUpdatedAt] = useState<DateTime>(DateTime.now());

    // interval does not run if `pollingIntervalMs` is falsey
    useInterval(() => {
        if (fetching || pause) {
            return;
        }

        reexecuteQuery({ requestPolicy });
        setUpdatedAt(DateTime.now());
    }, pollingIntervalMs || null);

    return { data, fetching, error, updatedAt };
}
