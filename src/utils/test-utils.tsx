/* eslint-disable @typescript-eslint/unbound-method */
// https://testing-library.com/docs/react-testing-library/setup#custom-render

import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { AuthContext } from 'context/Auth';
import AppContent from 'context/Content';
import AppRouter from 'context/Router';
import AppTheme from 'context/Theme';
import { ReactElement } from 'react';
import { sessionStorageKey } from 'services/auth';

const loginAsUser = (userName: string = 'fakeUserName') => {
    const mockDetails = {
        account_id: `${userName}-mock-token`,
        token: `${userName}-mock-token`,
    };

    window.localStorage.setItem(sessionStorageKey, JSON.stringify(mockDetails));
};

const logoutUser = () => {
    window.localStorage.removeItem(sessionStorageKey);
};

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

// Mocking AuthContext out basically skips all the loading screen and boostrapping
//  stuff that happens on load. This should be fine for unit testing as it
//  can help speed up tests a bit and makes things easier to deal with. This
//  does mean that we need to eventually write a basic test that handles the
//  account bootstrapping.
interface MockAuthProps {
    children: JSX.Element;
    username?: string;
}
const MockAuthProvider = ({ children, username }: MockAuthProps) => {
    const value = {
        login: jest.fn(() => {
            loginAsUser(username);
            return Promise.resolve();
        }),
        logout: jest.fn(() => {
            logoutUser();
            return Promise.resolve();
        }),
        user: username,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

const customRender = async (
    ui: ReactElement,
    options: Omit<RenderOptions, 'wrapper'> & {
        route?: string;
        user?: string;
    }
) => {
    const { route, user } = options;

    goTo(route, 'Test Page');

    const view = rtlRender(
        <AppContent>
            <MockAuthProvider username={user}>
                <AppTheme>
                    <AppRouter>{ui}</AppRouter>
                </AppTheme>
            </MockAuthProvider>
        </AppContent>,
        {
            ...options,
        }
    );

    await waitForLoading();

    return view;
};

export * from '@testing-library/react';
export { goTo, loginAsUser, logoutUser, customRender, waitForLoading };
