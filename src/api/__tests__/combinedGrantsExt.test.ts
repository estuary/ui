import { getAuthRoles } from 'api/combinedGrantsExt';
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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

const server = setupServer(
    http.all(`${SUPABASE_URL}/rest/v1/rpc/auth_roles`, ({ request }) => {
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

test('getAuthRoles will fetch roles that match the capability', async () => {
    const response = await getAuthRoles('read');
    expect(response).toEqual({
        data: adminRows,
        error: null,
    });
});
