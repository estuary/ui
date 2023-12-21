import { describe, expect, test } from 'vitest';
import { http, HttpResponse, server } from 'test/server/test-server';
import { getConnectors } from 'api/connectors';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const API_ENDPOINT = `${SUPABASE_URL}/rest/v1/connectors`;

const connectors = [
    {
        id: '00:00:00:00:00:00:00:00',
        detail: 'FooDB mock details',
        image_name: 'example.com/company/materialize-foo',
        image: 'http://example.com/image/path',
        recommended: true,
        title: 'FooDB',
        connector_tags: [
            {
                documentation_url:
                    'https://example.com/documentation/materialize-foo',
                protocol: 'materialization',
                image_tag: ':v1',
                id: '00:00:00:00:00:00:00:00',
                connector_id: '00:00:00:00:00:00:00:00',
                title: 'SQL Connection',
            },
        ],
    },
];

describe('getConnectors returns the raw response', () => {
    test('on success', async () => {
        server.use(
            http.all(API_ENDPOINT, () => {
                return HttpResponse.json(connectors);
            })
        );

        const response = await getConnectors(null, 'asc', null);
        expect(response).toEqual({
            body: connectors,
            count: null,
            data: connectors,
            error: null,
            status: 200,
            statusText: 'OK',
        });
    });

    test('on failure', async () => {
        const message = 'fake error message here';
        const status = 400;

        server.use(
            http.all(API_ENDPOINT, () => {
                return new HttpResponse(message, { status });
            })
        );

        const response = await getConnectors(null, 'asc', null);
        expect(response).toEqual({
            body: null,
            count: null,
            data: null,
            error: {
                message,
            },
            status,
            statusText: 'Bad Request',
        });
    });
});
