import { getAuthRoles } from 'api/combinedGrantsExt';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc/auth_roles`;

const adminRows = [
    { role_prefix: 'a/', capability: 'read' },
    { role_prefix: 'b/', capability: 'read' },
    { role_prefix: 'c/', capability: 'read' },
    { role_prefix: 'd/', capability: 'read' },
    { role_prefix: 'e/', capability: 'read' },
    { role_prefix: 'f/', capability: 'read' },
    { role_prefix: 'g/', capability: 'read' },
    { role_prefix: 'h/', capability: 'read' },
];

// TODO (testing)
// Server setup needs to move to a more global space eventually

const server = setupServer(
    http.all(API_ENDPOINT, ({ request }) => {
        const url = new URL(request.url);
        const offset = Number.parseInt(
            url.searchParams.get('offset') ?? '',
            10
        );
        const limit = Number.parseInt(url.searchParams.get('limit') ?? '', 10);

        return HttpResponse.json(adminRows.slice(offset, offset + limit));
    })
);

// server.events.on('request:start', ({ request }) => {
//     console.log('MSW intercepted:', request.method, request.url);
// });

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('getAuthRoles will fetch roles over multiple calls based on page size', async () => {
    const response = await getAuthRoles('read', 3);
    expect(response).toEqual({
        data: adminRows,
        error: null,
    });
});

describe('getAuthRoles handles errors by returning no data', () => {
    test('server errors returns the specific error', async () => {
        const fakeError = 'fake error message here';

        server.use(
            http.all(API_ENDPOINT, () => {
                return new HttpResponse(fakeError, { status: 400 });
            })
        );

        const response = await getAuthRoles('read', 3);
        expect(response).toEqual({
            data: null,
            error: {
                message: fakeError,
            },
        });
    });

    test('network errors return the "FetchError"', async () => {
        server.use(
            http.all(API_ENDPOINT, () => {
                return HttpResponse.error();
            })
        );

        const response = await getAuthRoles('read', 3);
        expect(response).toEqual({
            data: null,
            error: {
                code: '',
                details: '',
                hint: '',
                message: 'FetchError: Failed to fetch',
            },
        });
    });
});
