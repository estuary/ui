import { supabaseClient } from 'src/context/GlobalProviders';
import { graphql } from 'src/gql-types';

const REASON_PHRASES: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
};

export const PAGE_INFO_FRAGMENT = graphql(`
    fragment PageInfoFields on PageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
    }
`);

export const authedFetch: typeof fetch = async (request, init = {}) => {
    // fetch the auth token from supabase directly to ensure it's valid
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        throw error;
    }

    const token = data.session?.access_token;
    const reqHeaders = new Headers(init?.headers);
    if (token) {
        reqHeaders.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(request, { ...init, headers: reqHeaders });
    if (response.ok || response.headers.has('Content-Type')) {
        return response;
    }

    // The API sends some errors (e.g. a 401 for an expired token) as plain text
    // with no Content-Type, which URQL tries to parse as JSON. Label them
    // text/plain so the body becomes the error message.
    const resHeaders = new Headers(response.headers);
    resHeaders.set('Content-Type', 'text/plain; charset=utf-8');

    // an empty body would give an empty error message, so fall back
    const text =
        (await response.text()) ||
        REASON_PHRASES[response.status] ||
        `Request failed with status ${response.status}`;

    return new Response(text, {
        status: response.status,
        headers: resHeaders,
    });
};
