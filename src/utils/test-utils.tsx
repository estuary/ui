/* eslint-disable @typescript-eslint/unbound-method */
// https://testing-library.com/docs/react-testing-library/setup#custom-render

import { createClient, User } from '@supabase/supabase-js';
import { Auth } from '@supabase/ui';
import { AuthSession } from '@supabase/ui/dist/cjs/components/Auth/UserContext';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import AppContent from 'context/Content';
import AppRouter from 'context/Router';
import ThemeProvider from 'context/Theme';
import { mock } from 'jest-mock-extended';
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

const MockProviders = ({ children, username }: any) => {
    const mockClient = createClient('http://mock.url', 'MockSupabaseAnonKey');
    const mockAuthSession = mock<AuthSession>();

    if (username) {
        mockAuthSession.user = mock<User>();
        mockAuthSession.user.user_metadata.full_name = username;
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
export { goTo, customRender, waitForLoading };
