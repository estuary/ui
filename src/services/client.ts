import { FETCH_DEFAULT_ERROR, logRocketConsole } from 'src/services/shared';
import { getAuthHeader } from 'src/utils/misc-utils';

export interface ClientConfig<T> extends RequestInit {
    data?: T;
}

export const AUTH_ERROR = 'common.loggedOut';

export const client = <Response, Request = {}>(
    endpoint: string,
    { data, ...customConfig }: ClientConfig<Request> = {},
    token?: string,
    returnOriginalMessage?: boolean
): Promise<Response> => {
    const config: NonNullable<RequestInit> = {
        body: data ? JSON.stringify(data) : undefined,
        method: data ? 'POST' : 'GET',
        ...customConfig,
    };

    // Setup the headers
    const headersInit: HeadersInit = {};

    if (token) {
        const authHeaders = getAuthHeader(token);
        headersInit.Authorization = authHeaders.Authorization;
    }

    if (data) {
        headersInit['Content-Type'] = 'application/json';
    }

    config.headers = customConfig.headers
        ? { ...headersInit, ...customConfig.headers }
        : headersInit;

    const fetchPromise = window
        .fetch(endpoint, config)
        .then(async (response) => {
            if (response.status === 401) {
                return Promise.reject({ message: AUTH_ERROR });
            } else if (response.ok) {
                return response.json();
            } else {
                const errorBody = await response.json();
                return Promise.reject(errorBody);
            }
        })
        .catch((error) => {
            logRocketConsole('fetchPromise:error', error);
            return Promise.reject({
                message: returnOriginalMessage
                    ? error.message
                    : error?.message === AUTH_ERROR
                      ? AUTH_ERROR
                      : FETCH_DEFAULT_ERROR,
                ...error,
            });
        });

    return fetchPromise;
};
