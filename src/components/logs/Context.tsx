import type { PostgrestResponseSuccess } from '@supabase/postgrest-js';
import type { BaseComponentProps, ViewLogs_Line } from 'src/types';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { supabaseClient } from 'src/context/GlobalProviders';
import { DEFAULT_POLLING_INTERVAL, RPCS } from 'src/services/supabase';
import {
    hasLength,
    incrementInterval,
    timeoutCleanUp,
} from 'src/utils/misc-utils';

interface Props extends BaseComponentProps {
    token: string | null;
    jobCompleted?: boolean;
    disableIntervalFetching?: boolean;
    fetchAll?: boolean;
}

type LogsContextValue = {
    reset: () => void;
    logs: ViewLogs_Line[];
    networkFailure: boolean;
    stopped: boolean;
    fetchingCanSafelyStop: boolean;
};

const MAX_EMPTY_CALLS = 90; // about 1.5 minute
const MAX_INTERVAL = 1000; //  we don't want to wait too longer between pings
const LogsContext = createContext<LogsContextValue | null>(null);

const LogsContextProvider = ({
    children,
    token,
    jobCompleted,
    disableIntervalFetching,
    fetchAll,
}: Props) => {
    // Privates
    const allLogs = useRef<ViewLogs_Line[]>([]);
    const offset = useRef(0);
    const timeoutRef = useRef<number | undefined>();
    const interval = useRef(DEFAULT_POLLING_INTERVAL / 2);
    const emptyResponses = useRef(
        fetchAll || disableIntervalFetching ? MAX_EMPTY_CALLS : 0
    );

    // Publics
    const [logs, setLogs] = useState<ViewLogs_Line[]>([]);
    const [stopped, setStopped] = useState(false);
    const [networkFailure, setNetworkFailure] = useState(false);
    const [fetchingCanSafelyStop, setFetchingCanSafelyStop] = useState(false);

    // TODO (typing) - cannot get the rpc to play nice with overrideTypes
    //  ViewLogs_Line[] is what the type should be
    const fetchLogs = async (offsetVal: number) => {
        const queryParams = {
            bearer_token: token,
        };
        if (fetchAll) {
            return supabaseClient
                .rpc(RPCS.VIEW_LOGS, queryParams)
                .throwOnError();
        } else {
            return supabaseClient
                .rpc(RPCS.VIEW_LOGS, queryParams)
                .range(offsetVal, offsetVal + 10)
                .throwOnError();
        }
    };

    // The clean up that needs ran when logs stop
    //  broken out so when the job completes it can stop
    //  logs without showing warnings
    const stopCleanUp = (newCurrentValue: number) => {
        timeoutCleanUp(timeoutRef.current);
        emptyResponses.current = newCurrentValue;
    };

    // Used when the logs have stopped due to how many
    //  empty responses it has recieved or network error
    const stopLogs = (networkFailed?: boolean) => {
        stopCleanUp(emptyResponses.current + 1);
        setStopped(true);
        if (networkFailed) {
            setNetworkFailure(true);
        }
    };

    const start = () => {
        if (!token) return;

        const makeApiCall = () => {
            return fetchLogs(offset.current).then(
                (
                    fetchLogsResponse: PostgrestResponseSuccess<ViewLogs_Line[]>
                ) => {
                    timeoutCleanUp(timeoutRef.current);

                    if (fetchLogsResponse.error) {
                        stopLogs(true);
                    } else {
                        setNetworkFailure(false);

                        const { data: viewLogsResponse } = fetchLogsResponse;
                        if (hasLength(viewLogsResponse)) {
                            offset.current =
                                offset.current + viewLogsResponse.length;
                            allLogs.current =
                                allLogs.current.concat(viewLogsResponse);
                            setLogs(allLogs.current);
                        } else {
                            emptyResponses.current = emptyResponses.current + 1;
                        }

                        if (
                            !fetchAll &&
                            !disableIntervalFetching &&
                            MAX_EMPTY_CALLS >= emptyResponses.current
                        ) {
                            interval.current = incrementInterval(
                                interval.current,
                                MAX_INTERVAL
                            );
                            timeoutRef.current = window.setTimeout(
                                makeApiCall,
                                interval.current
                            );
                        } else {
                            stopLogs();
                        }
                    }
                },
                () => {
                    stopLogs(true);
                }
            );
        };
        timeoutRef.current = window.setTimeout(
            makeApiCall,
            DEFAULT_POLLING_INTERVAL * 2
        );
    };

    const reset = useCallback(() => {
        emptyResponses.current = 0;
        setFetchingCanSafelyStop(false);
        setNetworkFailure(false);
        setStopped(false);
        start();

        // Only need to make sure we get the latest logs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logs]);

    useEffect(() => {
        start();

        return () => {
            stopLogs();
        };
        // We only care about stuff that alters the query here
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, disableIntervalFetching, fetchAll]);

    useEffect(() => {
        // If the job completed then we only want to check for logs
        //  2 more times and then stop
        if (jobCompleted) {
            setFetchingCanSafelyStop(true);
            stopCleanUp(MAX_EMPTY_CALLS - 2);
            start();
        }
        // We only if the job completed to kick off the final fetching
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobCompleted]);

    return (
        <LogsContext.Provider
            value={{
                fetchingCanSafelyStop,
                logs,
                networkFailure,
                stopped,
                reset,
            }}
        >
            {children}
        </LogsContext.Provider>
    );
};

const useLogsContext = () => {
    const context = useContext(LogsContext);

    if (context === null) {
        throw new Error('useLogs must be used within a LogsContextProvider');
    }

    return context;
};

export { LogsContextProvider, useLogsContext };
