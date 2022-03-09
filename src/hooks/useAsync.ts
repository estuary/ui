import { useCallback, useLayoutEffect, useReducer, useRef } from 'react';

enum States {
    IDLE = 0,
    LOADING = 1,
    ERROR = 2,
    SUCCESS = 3,
}

const defaultInitialState = {
    data: null,
    error: null,
    status: States.IDLE,
};

const useSafeDispatch = (dispatch: any) => {
    const mounted = useRef(false);
    useLayoutEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    return useCallback(
        (...args) => (mounted.current ? dispatch(...args) : void 0),
        [dispatch]
    );
};

export interface UseAsyncResponse<T, U> {
    data: U extends any ? T : T | null;
    error: any;
    isError: boolean;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    reset: () => any;
    run: (promise: any, dataFetcher?: Function | undefined) => any;
    setData: (setDataResponse: any) => void;
    setError: (setErrorResponse: any) => any;
    status: States;
}

const useAsync = <DataType>(
    initialData?: any
): UseAsyncResponse<DataType, typeof initialData> => {
    const initialStateRef = useRef({
        ...defaultInitialState,
        ...{
            data: initialData,
        },
    });
    const [{ status, data, error }, setState] = useReducer(
        (s: any, a: any) => ({ ...s, ...a }),
        initialStateRef.current
    );

    const safeSetState = useSafeDispatch(setState);

    const setData = useCallback(
        (setDataResponse) => {
            safeSetState({ data: setDataResponse, status: States.SUCCESS });
        },
        [safeSetState]
    );
    const setError = useCallback(
        (setErrorResponse) =>
            safeSetState({ error: setErrorResponse, status: States.ERROR }),
        [safeSetState]
    );
    const reset = useCallback(
        () => safeSetState(initialStateRef.current),
        [safeSetState]
    );

    const run = useCallback(
        (promise: Promise<DataType>, dataProcessor?: any) => {
            safeSetState({ status: States.LOADING });
            return promise.then(
                (runResponse: any) => {
                    let response;

                    if (dataProcessor) {
                        dataProcessor(runResponse).then(
                            (dataProcessorResponse: any) => {
                                setData(dataProcessorResponse);
                            }
                        );
                    } else {
                        setData(runResponse);
                    }
                    return response;
                },
                (runResponseError: any) => {
                    setError(runResponseError);
                    return Promise.reject(runResponseError);
                }
            );
        },
        [safeSetState, setData, setError]
    );

    return {
        data,
        error,
        isError: status === States.ERROR,
        isIdle: status === States.IDLE,
        isLoading: status === States.LOADING,
        isSuccess: status === States.SUCCESS,
        reset,
        run,
        setData,
        setError,
        status,
    };
};

export { useAsync };
