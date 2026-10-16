import { Client, fetchExchange, gql } from 'urql';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { authedFetch } from 'src/services/gql';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

// Mock the module the Supabase client is defined in. Passing `import()`
// rather than a string makes TypeScript check the path, so moving or deleting
// that module fails type checking here instead of silently leaving the real
// client in place.
vi.mock(import('src/services/supabaseClient'), () => ({
    supabaseClient: { auth: { getSession } } as never,
}));

// Shape of supabase.auth.getSession(); a null session means signed out
const sessionWith = (accessToken: string | null) => ({
    data: {
        session: accessToken ? { access_token: accessToken } : null,
    },
    error: null,
});

const okResponse = () =>
    new Response(JSON.stringify({ data: { __typename: 'Query' } }), {
        headers: { 'Content-Type': 'application/json' },
    });

// The request options customFetch handed to the underlying fetch
function sentInit(fetchMock: ReturnType<typeof vi.fn>, call = 0) {
    const [, init] = fetchMock.mock.calls[call] as [unknown, RequestInit];
    return init;
}

const sentHeaders = (fetchMock: ReturnType<typeof vi.fn>, call = 0) =>
    new Headers(sentInit(fetchMock, call).headers);

const QUERY = gql`
    query {
        __typename
    }
`;

const TOKEN_ERROR = 'failed to verify token: ExpiredSignature';

// What the API sends for an expired token: a plain-text body with no
// Content-Type. A string body would make Response add `text/plain` itself,
// so pass bytes to keep the header off like the real response.
const unlabelledError = (statusText: string) =>
    new Response(new TextEncoder().encode(TOKEN_ERROR), {
        status: 401,
        statusText,
    });

// Production serves HTTP/2, which has no status text
const http2Unauthorized = () => unlabelledError('');

function queryWith(fetchImpl: typeof fetch) {
    const client = new Client({
        url: 'https://api.example.com/api/graphql',
        exchanges: [fetchExchange],
        fetch: fetchImpl,
    });

    return client.query(QUERY, {}).toPromise();
}

describe('authedFetch', () => {
    beforeEach(() => {
        getSession.mockResolvedValue(sessionWith('fresh-token'));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('authorization', () => {
        test('sends the current Supabase access token', async () => {
            const fetchMock = vi.fn(async () => okResponse());
            vi.stubGlobal('fetch', fetchMock);

            await queryWith(authedFetch);

            expect(sentHeaders(fetchMock).get('Authorization')).toBe(
                'Bearer fresh-token'
            );
        });

        test('reads the session for every request, picking up refreshed tokens', async () => {
            const fetchMock = vi.fn(async () => okResponse());
            vi.stubGlobal('fetch', fetchMock);

            await authedFetch('https://api.example.com/api/graphql');
            getSession.mockResolvedValue(sessionWith('refreshed-token'));
            await authedFetch('https://api.example.com/api/graphql');

            expect(getSession).toHaveBeenCalledTimes(2);
            expect(sentHeaders(fetchMock, 1).get('Authorization')).toBe(
                'Bearer refreshed-token'
            );
        });

        test('replaces a stale Authorization header and keeps the others', async () => {
            const fetchMock = vi.fn(async () => okResponse());
            vi.stubGlobal('fetch', fetchMock);

            await authedFetch('https://api.example.com/api/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer stale-token',
                    'Content-Type': 'application/json',
                },
            });

            const headers = sentHeaders(fetchMock);
            expect(headers.get('Authorization')).toBe('Bearer fresh-token');
            expect(headers.get('Content-Type')).toBe('application/json');
            expect(sentInit(fetchMock).method).toBe('POST');
        });

        test('sends no Authorization header when signed out', async () => {
            getSession.mockResolvedValue(sessionWith(null));
            const fetchMock = vi.fn(async () => okResponse());
            vi.stubGlobal('fetch', fetchMock);

            await queryWith(authedFetch);

            // Without this, an unwired mock would pass here too: the real
            // client has no session in tests either
            expect(getSession).toHaveBeenCalledTimes(1);
            expect(sentHeaders(fetchMock).has('Authorization')).toBe(false);
        });

        describe('when Supabase fails to load the session', () => {
            const sessionError = new Error('Refresh Token Not Found');

            beforeEach(() => {
                getSession.mockResolvedValue({
                    data: { session: null },
                    error: sessionError,
                });
            });

            test('rejects with the Supabase error without sending the request', async () => {
                const fetchMock = vi.fn(async () => okResponse());
                vi.stubGlobal('fetch', fetchMock);

                await expect(
                    authedFetch('https://api.example.com/api/graphql')
                ).rejects.toBe(sessionError);
                expect(fetchMock).not.toHaveBeenCalled();
            });

            test('surfaces the Supabase error as the query error', async () => {
                const fetchMock = vi.fn(async () => okResponse());
                vi.stubGlobal('fetch', fetchMock);

                const result = await queryWith(authedFetch);

                expect(result.error?.networkError).toBe(sessionError);
                expect(result.data).toBeUndefined();
                expect(fetchMock).not.toHaveBeenCalled();
            });
        });
    });

    test('surfaces the body of a plain-text error instead of a JSON parse error', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => http2Unauthorized())
        );

        // Without the wrapper, URQL tries to parse the body as JSON
        const unwrapped = await queryWith(fetch);
        expect(unwrapped.error?.networkError).toBeInstanceOf(SyntaxError);

        const result = await queryWith(authedFetch);
        expect(result.error?.networkError?.message).toBe(TOKEN_ERROR);
        // Callers branch on the status, so it must survive the rewrite
        expect(result.error?.response?.status).toBe(401);
    });

    test('prefers the body over the status text', async () => {
        // Locally the API serves HTTP/1.1, which sends "Unauthorized"
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => unlabelledError('Unauthorized'))
        );

        const result = await queryWith(authedFetch);
        expect(result.error?.networkError?.message).toBe(TOKEN_ERROR);
    });

    describe('when the error body is empty', () => {
        // A null body leaves Content-Type unset, like the real response
        const emptyUnauthorized = (statusText: string) =>
            new Response(null, { status: 401, statusText });

        test('uses the reason phrase for the status', async () => {
            vi.stubGlobal(
                'fetch',
                vi.fn(async () => emptyUnauthorized(''))
            );

            const result = await queryWith(authedFetch);
            expect(result.error?.networkError?.message).toBe('Unauthorized');
            expect(result.error?.response?.status).toBe(401);
        });

        test('falls back to a generic message for an unlisted status', async () => {
            vi.stubGlobal(
                'fetch',
                vi.fn(async () => new Response(null, { status: 418 }))
            );

            const result = await queryWith(authedFetch);
            expect(result.error?.networkError?.message).toBe(
                'Request failed with status 418'
            );
            expect(result.error?.response?.status).toBe(418);
        });
    });

    test('leaves responses that declare a Content-Type alone', async () => {
        const graphqlError = new Response(
            JSON.stringify({ errors: [{ message: 'not allowed' }] }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        );
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => graphqlError)
        );

        const result = await queryWith(authedFetch);
        expect(result.error?.graphQLErrors[0]?.message).toBe('not allowed');
    });

    test('passes successful responses through untouched', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => okResponse())
        );

        const result = await queryWith(authedFetch);
        expect(result.error).toBeUndefined();
        expect(result.data).toEqual({ __typename: 'Query' });
    });
});
