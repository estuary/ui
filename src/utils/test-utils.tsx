/* eslint-disable @typescript-eslint/unbound-method */
// https://testing-library.com/docs/react-testing-library/setup#custom-render

import { createClient, User } from '@supabase/supabase-js';
import { Auth } from '@supabase/ui';
import { AuthSession } from '@supabase/ui/dist/cjs/components/Auth/UserContext';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import AppContent from 'context/Content';
import AppRouter from 'context/Router';
import ThemeProvider from 'context/Theme';
import produce from 'immer';
import { mockDeep } from 'jest-mock-extended';
import { ReactElement } from 'react';
import { SwrSupabaseContext } from 'supabase-swr';

const goTo = (route?: string, name?: string) => {
    window.history.pushState(
        {},
        name ? name : 'Test page',
        route ? route : '/'
    );
};

const waitForLoading = async () => {
    return Promise.resolve();
};

// TODO - We use immer here but don't need it. The user metadata is currently just
//  any number of keys (according to the types). Hoping that changes in the future.
const generateMockUserMetadata = (username: string) => {
    return produce(mockDeep<User['user_metadata']>(), (draft) => {
        draft.avatar_url = `https://example.org/avatar/${username}`;
        draft.email = `${username}@example.org`;
        draft.email_verified = true;
        draft.full_name = `Full ${username}`;
        draft.iss = 'https://api.example.org';
        draft.name = username;
        draft.picture = `https://example.org/picture/${username}`;
        draft.preferred_username = username;
        draft.provider_id = '102885624013818367764';
        draft.sub = '102885624013818367764';
        draft.user_name = username;

        return draft;
    });
};

const MockProviders = ({ children, username }: any) => {
    const mockClient = createClient('http://mock.url', 'MockSupabaseAnonKey');
    const mockAuthSession = mockDeep<AuthSession>();

    if (username) {
        mockAuthSession.user = mockDeep<User>();
        mockAuthSession.user.user_metadata = generateMockUserMetadata(username);
        Auth.useUser = () => mockAuthSession;
    }

    return (
        <SwrSupabaseContext.Provider value={mockClient}>
            <Auth.UserContextProvider supabaseClient={mockClient}>
                {children}
            </Auth.UserContextProvider>
        </SwrSupabaseContext.Provider>
    );
};

const customRender = async (
    ui: ReactElement,
    options: Omit<RenderOptions, 'wrapper'> & {
        route?: string;
        username?: string;
    }
) => {
    const { route, username } = options;

    goTo(route, 'Test Page');

    const view = rtlRender(
        <AppContent>
            <MockProviders username={username}>
                <ThemeProvider>
                    <AppRouter>{ui}</AppRouter>
                </ThemeProvider>
            </MockProviders>
        </AppContent>,
        {
            ...options,
        }
    );

    await waitForLoading();

    return view;
};

export * from '@testing-library/react';
export { generateMockUserMetadata, goTo, customRender, waitForLoading };
