import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OAuthConsent } from 'src/pages/OAuthConsent';

const state = vi.hoisted(() => ({
    query: 'request=ticket',
    token: 'session-token',
    userId: 'user-1',
}));
vi.mock('react-router-dom', () => ({
    useSearchParams: () => [new URLSearchParams(state.query)],
}));
vi.mock('react-helmet-async', () => ({ Helmet: () => null }));
vi.mock('src/app/routes', () => ({
    authenticatedRoutes: { oauthConsent: { title: 'Authorize' } },
}));
vi.mock('src/stores/TopBar/Store', () => ({
    useTopBarStore: (selector: (value: unknown) => unknown) =>
        selector({ setHeader: vi.fn() }),
}));
vi.mock('src/utils/env-utils', () => ({
    requireEstuaryApiUrl: () => 'https://api.example.test',
}));
vi.mock('src/utils/misc-utils', () => ({
    getURL: (value: string) => {
        try {
            return new URL(value);
        } catch {
            return null;
        }
    },
}));
vi.mock('src/context/User/useUserContextStore', () => ({
    useUserStore: (selector: (value: unknown) => unknown) =>
        selector({
            session: { access_token: state.token, user: { id: state.userId } },
        }),
}));

vi.mock('src/services/supabaseClient', () => ({
    supabaseClient: {
        auth: {
            getSession: async () => ({
                data: {
                    session: {
                        access_token: state.token,
                        user: { id: state.userId },
                    },
                },
                error: null,
            }),
        },
    },
}));

const context = {
    client_name: 'Example Client',
    request: {
        client_id: 'https://client.example.test/metadata',
    },
};
const fetchMock = vi.fn();
beforeEach(() => {
    state.query = 'request=ticket';
    state.token = 'session-token';
    state.userId = 'user-1';
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true, json: async () => context });
    vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('OAuth consent', () => {
    it.each([
        ['Approve', true],
        ['Cancel', false],
    ])(
        'posts %s with a bearer and the request ticket',
        async (button, approved) => {
            render(<OAuthConsent />);
            const action = await screen.findByRole('button', {
                name: button as string,
            });
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock.mock.calls[0][0]).toBe(
                'https://api.example.test/oauth/consent-context?request=ticket'
            );
            expect(fetchMock.mock.calls[0][1].headers).toBeUndefined();
            // Both requests must omit Referer so the consent ticket in the page URL cannot leak.
            expect(fetchMock.mock.calls[0][1].referrerPolicy).toBe(
                'no-referrer'
            );
            fetchMock.mockResolvedValueOnce({ ok: false, status: 403 });
            fireEvent.click(action);
            await screen.findByText(/Unable to authorize this request/);
            expect(fetchMock.mock.calls[1][0]).toBe(
                'https://api.example.test/oauth/authorize'
            );
            expect(fetchMock.mock.calls[1][1]).toMatchObject({
                method: 'POST',
                headers: { Authorization: 'Bearer session-token' },
                body: JSON.stringify({ request: 'ticket', approved }),
                referrerPolicy: 'no-referrer',
                redirect: 'error',
                credentials: 'omit',
            });
        }
    );
    it.each(['token', 'ticket', 'user'] as const)(
        'handles a %s change during submission',
        async (change) => {
            const replace = vi.fn();
            vi.stubGlobal('location', { ...window.location, replace });
            const view = render(<OAuthConsent />);
            const approve = await screen.findByRole('button', {
                name: 'Approve',
            });
            let resolvePost!: (value: unknown) => void;
            fetchMock.mockReturnValueOnce(
                new Promise((resolve) => {
                    resolvePost = resolve;
                })
            );
            await act(async () => {
                fireEvent.click(approve);
            });
            const signal = fetchMock.mock.calls[1][1].signal as AbortSignal;

            if (change === 'token') state.token = 'refreshed-token';
            if (change === 'ticket') state.query = 'request=another-ticket';
            if (change === 'user') state.userId = 'user-2';
            view.rerender(<OAuthConsent />);
            expect(signal.aborted).toBe(change !== 'token');
            if (change === 'token') {
                expect(fetchMock).toHaveBeenCalledTimes(2);
                expect(approve).toHaveProperty('disabled', true);
            }

            // Even a response that finishes after cancellation cannot redirect the new flow.
            await act(async () => {
                resolvePost({
                    ok: true,
                    json: async () => ({
                        redirect_uri: 'https://client.example.test/callback',
                    }),
                });
            });
            expect(replace).toHaveBeenCalledTimes(change === 'token' ? 1 : 0);
        }
    );
});
