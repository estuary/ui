/* eslint-disable @typescript-eslint/unbound-method */
// https://testing-library.com/docs/react-testing-library/setup#custom-render

import { createClient } from '@supabase/supabase-js';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import AppContent from 'context/Content';
import AppRouter from 'context/Router';
import ThemeProvider from 'context/Theme';
import { createContext, ReactElement } from 'react';

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

const MockUserProvider = ({ children, username }: any) => {
    return (
        <>
            Your user name is {username} and {children}
        </>
    );
};

const MockClientProvider = ({ children }: any) => {
    const mockClient = createClient('http://mock.url', 'MockSupabaseAnonKey');

    const MockClient = createContext({});

    return (
        <MockClient.Provider
            value={{
                useClient: () => mockClient,
            }}
        >
            {children}
        </MockClient.Provider>
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
            <MockClientProvider>
                <MockUserProvider username={username}>
                    <ThemeProvider>
                        <AppRouter>{ui}</AppRouter>
                    </ThemeProvider>
                </MockUserProvider>
            </MockClientProvider>
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
