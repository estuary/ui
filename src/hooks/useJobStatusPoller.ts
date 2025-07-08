import type {
    PostgrestFilterBuilder,
    PostgrestTransformBuilder,
} from '@supabase/postgrest-js';
import type { PollerTimeout } from 'src/services/supabase';

import { useCallback, useMemo, useRef, useState } from 'react';

import { useUnmount } from 'react-use';

import { logRocketConsole, retryAfterFailure } from 'src/services/shared';
import {
    DEFAULT_POLLING_INTERVAL,
    handleFailure,
    JOB_STATUS_POLLER_ERROR,
} from 'src/services/supabase';
import {
    incrementInterval,
    isPostgrestFetcher,
    timeoutCleanUp,
} from 'src/utils/misc-utils';
import { checkIfPublishIsDone } from 'src/utils/publication-utils';

export function useQueryPoller<T = any>(
    key: string,
    checkIfDone: (response: T, attempts: number) => [boolean | null, T]
) {
    const interval = useRef(DEFAULT_POLLING_INTERVAL);
    const [pollerTimeout, setPollerTimeout] =
        useState<PollerTimeout>(undefined);

    const queryPoller = useCallback(
        (
            query:
                | PostgrestFilterBuilder<any, any, T, any, any>
                | PostgrestTransformBuilder<any, any, T, any, any>
                | Function,
            success: Function,
            failure: Function,
            initWait?: number
        ) => {
            let attempts = 0;
            const makeApiCall = () => {
                logRocketConsole(`Poller : ${key} : start `, { pollerTimeout });

                return (
                    isPostgrestFetcher<T>(query)
                        ? query.throwOnError()
                        : query()
                ).then(
                    (payload: any) => {
                        timeoutCleanUp(pollerTimeout);

                        if (payload.error) {
                            failure(handleFailure(payload.error));
                        } else {
                            const [publicationOutcome, publicationResponse] =
                                checkIfDone(payload, attempts);

                            if (publicationOutcome === null) {
                                interval.current = incrementInterval(
                                    interval.current
                                );
                                setPollerTimeout(
                                    window.setTimeout(
                                        makeApiCall,
                                        interval.current
                                    )
                                );
                            } else if (publicationOutcome) {
                                success(publicationResponse);
                            } else {
                                failure(publicationResponse);
                            }
                        }
                    },
                    (error: any) => {
                        if (
                            attempts === 0 &&
                            typeof error?.message === 'string' &&
                            retryAfterFailure(error.message)
                        ) {
                            logRocketConsole(
                                `Poller : ${key} : error : trying again `
                            );
                            attempts += 1;

                            // We do not update the interval here like we do up above
                            //  because we just want this one time to wait a bit longer
                            setPollerTimeout(
                                window.setTimeout(
                                    makeApiCall,
                                    incrementInterval(interval.current)
                                )
                            );
                        } else {
                            logRocketConsole(
                                `Poller : ${key} : error : returning failure `
                            );
                            timeoutCleanUp(pollerTimeout);
                            failure(handleFailure(JOB_STATUS_POLLER_ERROR));
                        }
                    }
                );
            };

            setPollerTimeout(
                window.setTimeout(
                    makeApiCall,
                    initWait ?? DEFAULT_POLLING_INTERVAL * 2
                )
            );
        },
        [checkIfDone, key, pollerTimeout]
    );

    useUnmount(() => {
        logRocketConsole(`Poller : ${key} : poller : clean up`, pollerTimeout);
        timeoutCleanUp(pollerTimeout);
    });

    return queryPoller;
}

function useJobStatusPoller<T = any>() {
    const jobStatusPoller = useQueryPoller<T>(
        'JobStatus',
        checkIfPublishIsDone
    );
    return useMemo(() => ({ jobStatusPoller }), [jobStatusPoller]);
}

export default useJobStatusPoller;
