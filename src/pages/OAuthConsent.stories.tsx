import type { Meta, StoryObj } from '@storybook/react-vite';

import { useEffect, useState } from 'react';

import { Alert } from '@mui/material';

import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import { useUserStore } from 'src/context/User/useUserContextStore';
import enUSMessages from 'src/lang/en-US';
import { OAuthConsent } from 'src/pages/OAuthConsent';
import { supabaseClient } from 'src/services/supabaseClient';
import { useTopBarStore } from 'src/stores/TopBar/Store';
import { requireEstuaryApiUrl } from 'src/utils/env-utils';

function ConsentPreview() {
    const [ready, setReady] = useState(false);
    const [decision, setDecision] = useState<string>();

    useEffect(() => {
        const originalFetch = window.fetch;
        const originalGetSession = supabaseClient.auth.getSession;
        supabaseClient.auth.getSession = async () => {
            const previewSession = useUserStore.getState().session;
            return previewSession
                ? { data: { session: previewSession }, error: null }
                : { data: { session: null }, error: null };
        };
        const session = useUserStore.getState().session;
        const header = useTopBarStore.getState().header;
        const originalUrl = window.location.href;
        const apiUrl = requireEstuaryApiUrl();

        useUserStore.setState({
            session: {
                access_token: 'storybook-session',
                refresh_token: '',
                expires_in: 3600,
                token_type: 'bearer',
                user: {
                    id: 'storybook-user',
                    app_metadata: {},
                    user_metadata: {},
                    aud: 'authenticated',
                    created_at: '',
                },
            },
        });

        window.fetch = async (input, init) => {
            const url = new URL(
                input instanceof Request ? input.url : String(input),
                window.location.origin
            );
            if (url.origin === new URL(apiUrl).origin) {
                if (url.pathname === '/oauth/consent-context') {
                    return Response.json({
                        client_name: 'Example application',
                        request: {
                            client_id: 'https://client.example.com/metadata',
                        },
                    });
                }
                if (url.pathname === '/oauth/authorize') {
                    const { approved } = JSON.parse(String(init?.body));
                    const result = approved ? 'approved' : 'cancelled';
                    setDecision(result);
                    // Keep the mock callback in this preview instead of leaving Storybook.
                    const callback = new URL(originalUrl);
                    callback.hash = `consent-${result}`;
                    return Response.json({ redirect_uri: callback.href });
                }
            }
            return originalFetch(input, init);
        };
        setReady(true);

        return () => {
            window.fetch = originalFetch;
            supabaseClient.auth.getSession = originalGetSession;
            useUserStore.setState({ session });
            useTopBarStore.setState({ header });
            window.history.replaceState(window.history.state, '', originalUrl);
        };
    }, []);

    return (
        <IntlProvider locale="en" messages={enUSMessages}>
            <HelmetProvider>
                <MemoryRouter
                    initialEntries={['/oauth/consent?request=storybook']}
                >
                    {decision ? (
                        <Alert severity="success">
                            {`Mock authorization ${decision}. No access was granted. Reload the story to try again.`}
                        </Alert>
                    ) : null}
                    {ready ? <OAuthConsent /> : null}
                </MemoryRouter>
            </HelmetProvider>
        </IntlProvider>
    );
}

const meta: Meta<typeof OAuthConsent> = {
    title: 'Pages/OAuthConsent',
    component: OAuthConsent,
    parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof OAuthConsent>;

export const Default: Story = {
    render: () => <ConsentPreview />,
};
