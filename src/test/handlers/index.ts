import { http, HttpResponse } from 'msw';

import type { RequestHandler } from 'src/test/server/test-server';
import { SUPABASE_URL } from 'src/test/shared';

const handlers: RequestHandler[] = [];

// TODO (testing|api)
// We don't want to mock all this by hand. Eventually we want to automate that
// Also we don't want one massive file so we'll want to break this stuff up somehow.
const API_URL_CONNECTORS = `${SUPABASE_URL}/rest/v1/connectors`;
const AUTH_URL = `${SUPABASE_URL}/auth/v1`;

const connectors = [
    {
        id: '00:00:00:00:00:00:00:00',
        detail: 'FooDB mock details',
        image_name: 'example.com/company/materialize-foo',
        // image: 'http://example.com/image/path',
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

handlers.push(
    http.all(API_URL_CONNECTORS, async () => {
        console.log('hit the connector');
        return HttpResponse.json(connectors);
    })
);

handlers.push(
    http.all(AUTH_URL, async () => {
        console.log('hit the auth');
        return HttpResponse.json({});
    })
);

export { handlers };
