import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useState,
    useRef,
} from 'react';
import { BaseComponentProps } from 'types';
import { DEFAULT_POLLING_INTERVAL, RPCS } from 'services/supabase';
import { hasLength, incrementInterval, timeoutCleanUp } from 'utils/misc-utils';
import { useClient } from 'hooks/supabase-swr';

interface Props extends BaseComponentProps {
    token: string | null;
    disableIntervalFetching?: boolean;
    fetchAll?: boolean;
}

type LogsContextValue = {
    reset: () => void;
    logs: any[];
    networkFailure: boolean;
    stopped: boolean;
};

const MAX_EMPTY_CALLS = 25; // about 1.5 minutes
const MAX_INTERVAL = 1000; //  we don't want to wait too longer between pings
const LogsContext = createContext<LogsContextValue | null>(null);

const LogsContextProvider = ({
    children,
    token,
    disableIntervalFetching,
    fetchAll,
}: Props) => {
    const supabaseClient = useClient();

    // Privates
    const allLogs = useRef<string[]>([]);
    const offset = useRef(0);
    const timeoutRef = useRef<number | undefined>();
    const interval = useRef(DEFAULT_POLLING_INTERVAL / 2);
    const emptyResponses = useRef(
        disableIntervalFetching ? MAX_EMPTY_CALLS : 0
    );

    // Publics
    const [logs, setLogs] = useState<string[]>([]);
    const [stopped, setStopped] = useState(false);
    const [networkFailure, setNetworkFailure] = useState(false);

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
                .throwOnError()
                .range(offsetVal, offsetVal + 10);
        }
    };

    const stopLogs = (networkFailed?: boolean) => {
        timeoutCleanUp(timeoutRef.current);
        setStopped(true);
        emptyResponses.current = emptyResponses.current + 1;
        if (networkFailed) {
            setNetworkFailure(true);
        }
    };

    const start = () => {
        if (!token) return;

        const makeApiCall = () => {
            return fetchLogs(offset.current).then(
                (fetchLogsResponse) => {
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

    return (
        <LogsContext.Provider
            value={{
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
