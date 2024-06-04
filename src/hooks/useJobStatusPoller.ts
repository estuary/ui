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

function useJobStatusPoller() {
    const interval = useRef(DEFAULT_POLLING_INTERVAL);
    const [pollerTimeout, setPollerTimeout] =
        useState<PollerTimeout>(undefined);

    const jobStatusPoller = useCallback(
        (
            query: any,
            success: Function,
            failure: Function,
            initWait?: number
        ) => {
            let attempts = 0;
            const makeApiCall = () => {
                logRocketConsole('Poller : start ', { pollerTimeout });

                return query.throwOnError().then(
                    (payload: any) => {
                        logRocketConsole('Poller : response');
                        timeoutCleanUp(pollerTimeout);

                        if (payload.error) {
                            failure(handleFailure(payload.error));
                        } else {
                            const [publicationOutcome, publicationResponse] =
                                checkIfPublishIsDone(payload);

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
                        logRocketConsole('Poller : error : ', error);

                        if (
                            attempts === 0 &&
                            typeof error?.message === 'string' &&
                            retryAfterFailure(error.message)
                        ) {
                            logRocketConsole('Poller : error : trying again');
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
        [pollerTimeout]
    );

    useUnmount(() => {
        logRocketConsole('clean up pollerTimeout = ', pollerTimeout);
        timeoutCleanUp(pollerTimeout);
    });

    return useMemo(() => ({ jobStatusPoller }), [jobStatusPoller]);
}

export default useJobStatusPoller;
