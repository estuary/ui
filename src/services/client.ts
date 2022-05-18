export interface ClientConfig<T> extends RequestInit {
    data?: T;
}

export const client = <Response, Request = {}>(
    endpoint: string,
    { data, ...customConfig }: ClientConfig<Request> = {}
): Promise<Response> => {
    const config: NonNullable<RequestInit> = {
        body: data ? JSON.stringify(data) : undefined,
        method: data ? 'POST' : 'GET',
        ...customConfig,
    };

    // Setup the headers
    const headersInit: HeadersInit = {};

    // TODO (REST) - we'll eventually need this client again. We'll need to pull the auth headers from Supabase-SWR some how.
    // const authHeader = auth.getAuthHeader();
    // if (authHeader) {
    //     headersInit.Authorization = authHeader;
    // }

    if (data) {
        headersInit['Content-Type'] = 'application/json';
    }

    config.headers = headersInit;

    const fetchPromise = window
        .fetch(endpoint, config)
        .then(async (response) => {
            if (response.status === 401) {
                // await auth.signout();
                return Promise.reject({ message: 'common.loggedOut' });
            } else if (response.ok) {
                return response.json();
            } else {
                const errorBody = await response.json();
                return Promise.reject(errorBody);
            }
        })
        .catch((error) => {
            return Promise.reject({
                message: 'Server Error',
                ...error,
            });
        });

    return fetchPromise;
};
