import { useCallback, useMemo, useRef, useState } from 'react';
import { useUnmount } from 'react-use';
import { logRocketConsole, retryAfterFailure } from 'services/shared';
import {
    DEFAULT_POLLING_INTERVAL,
    handleFailure,
    JOB_STATUS_POLLER_ERROR,
    JOB_STATUS_SUCCESS,
    PollerTimeout,
} from 'services/supabase';
import { hasLength, incrementInterval, timeoutCleanUp } from 'utils/misc-utils';

function useJobStatusPoller() {
    const interval = useRef(DEFAULT_POLLING_INTERVAL);
    const [attempts, setAttempts] = useState<number>(0);
    const [pollerTimeout, setPollerTimeout] =
        useState<PollerTimeout>(undefined);

    const jobStatusPoller = useCallback(
        (
            query: any,
            success: Function,
            failure: Function,
            initWait?: number
        ) => {
            const makeApiCall = () => {
                logRocketConsole('Poller : start ', { pollerTimeout });

                return query.throwOnError().then(
                    (payload: any) => {
                        logRocketConsole('Poller : response');
                        timeoutCleanUp(pollerTimeout);

                        if (payload.error) {
                            failure(handleFailure(payload.error));
                        } else {
                            const response =
                                (payload &&
                                    hasLength(payload.data) &&
                                    payload.data[0]) ??
                                null;
                            if (
                                response?.job_status?.type &&
                                response.job_status.type !== 'queued'
                            ) {
                                logRocketConsole(
                                    `Poller : response : ${response.job_status.type}`,
                                    response
                                );

                                if (
                                    JOB_STATUS_SUCCESS.includes(
                                        response.job_status.type
                                    )
                                ) {
                                    success(response);
                                } else {
                                    failure(response);
                                }
                            } else {
                                logRocketConsole(
                                    'Poller : response : trying again'
                                );

                                interval.current = incrementInterval(
                                    interval.current
                                );
                                setPollerTimeout(
                                    window.setTimeout(
                                        makeApiCall,
                                        interval.current
                                    )
                                );
                            }
                        }
                    },
                    (error: any) => {
                        logRocketConsole('Poller : error : ', error);

                        if (
                            attempts === 0 &&
                            typeof error?.message === 'string' &&
                            retryAfterFailure(error.message)
                        ) {
                            logRocketConsole('Poller : error : trying again');
                            setAttempts((previous) => {
                                return (previous += 1);
                            });

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
                                'Poller : error : returning failure'
                            );
                            timeoutCleanUp(pollerTimeout);
                            failure(handleFailure(JOB_STATUS_POLLER_ERROR));
                        }
                    }
                );
            };

            logRocketConsole('Poller : init ');

            setPollerTimeout(
                window.setTimeout(
                    makeApiCall,
                    initWait ?? DEFAULT_POLLING_INTERVAL * 2
                )
            );
        },
        [attempts, pollerTimeout]
    );

    useUnmount(() => {
        logRocketConsole('clean up pollerTimeout = ', pollerTimeout);
        timeoutCleanUp(pollerTimeout);
    });

    return useMemo(
        () => ({ attempts, jobStatusPoller }),
        [attempts, jobStatusPoller]
    );
}

export default useJobStatusPoller;
