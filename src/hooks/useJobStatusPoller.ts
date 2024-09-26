import {
    PostgrestFilterBuilder,
    PostgrestTransformBuilder,
} from '@supabase/postgrest-js';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useUnmount } from 'react-use';
import { logRocketConsole, retryAfterFailure } from 'services/shared';
import {
    DEFAULT_POLLING_INTERVAL,
    handleFailure,
    JOB_STATUS_POLLER_ERROR,
    PollerTimeout,
} from 'services/supabase';
import { incrementInterval, timeoutCleanUp } from 'utils/misc-utils';
import { checkIfPublishIsDone } from 'utils/publication-utils';

export function useQueryPoller<T = any>(
    key: string,
    checkIfDone: (response: T) => [boolean | null, T]
) {
    const interval = useRef(DEFAULT_POLLING_INTERVAL);
    const [pollerTimeout, setPollerTimeout] =
        useState<PollerTimeout>(undefined);

    const jobStatusPoller = useCallback(
        (
            query:
                | PostgrestFilterBuilder<any, any, T, any, any>
                | PostgrestTransformBuilder<any, any, T, any, any>,
            success: Function,
            failure: Function,
            initWait?: number
        ) => {
            let attempts = 0;
            const makeApiCall = () => {
                logRocketConsole(`Poller : ${key} : start `, { pollerTimeout });

                return query.throwOnError().then(
                    (payload: any) => {
                        logRocketConsole(`Poller : ${key} : response `);
                        timeoutCleanUp(pollerTimeout);

                        if (payload.error) {
                            failure(handleFailure(payload.error));
                        } else {
                            const [publicationOutcome, publicationResponse] =
                                checkIfDone(payload);

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
                        logRocketConsole(`Poller : ${key} : error `, error);

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

            logRocketConsole(`Poller : ${key} : init `);

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

    return useMemo(() => ({ jobStatusPoller }), [jobStatusPoller]);
}

function useJobStatusPoller<T = any>() {
    return useQueryPoller<T>('JobStatus', checkIfPublishIsDone);
}

export default useJobStatusPoller;
