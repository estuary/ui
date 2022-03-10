import { auth } from './auth';

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
    const authHeader = auth.getAuthHeader();
    if (authHeader) {
        headersInit.Authorization = authHeader;
    }

    if (data) {
        headersInit['Content-Type'] = 'application/json';
    }

    config.headers = headersInit;

    // TODO Sometimes rest returns the full path so handling that here for now
    const fullEndpoint = /^(http)s?:\/\//i.test(endpoint)
        ? endpoint
        : `${process.env.REACT_APP_API_BASE_URL}/${endpoint}`;

    const fetchPromise = window
        .fetch(fullEndpoint, config)
        .then(async (response) => {
            if (response.status === 401) {
                await auth.signout();
                return Promise.reject({ message: 'common.loggedOut' });
            } else if (response.ok) {
                return response.json();
            } else {
                const errorMessage = await response.text();
                return Promise.reject(new Error(errorMessage));
            }
        })
        .catch((error) => {
            console.log('Failed client call', error);
        });

    return fetchPromise;
};
