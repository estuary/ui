/* eslint-disable @typescript-eslint/unbound-method */
// https://testing-library.com/docs/react-testing-library/setup#custom-render

import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { AuthContext } from 'context/Auth';
import AppContent from 'context/Content';
import AppRouter from 'context/Router';
import AppTheme from 'context/Theme';
import { add, getUnixTime } from 'date-fns';
import { ReactElement } from 'react';
import { auth } from 'services/auth';

const getMockTokenReduced = (username: string) => {
    return {
        accessToken: 'access_token_value',
        ext: {
            avatarURL: 'http://example.org',
            displayName: username,
            email: 'userName@example.org',
            firstName: 'Firstname',
            lastName: 'Lastname',
            locale: 'en',
            orgs: ['example.org'],
        },
        expires: getUnixTime(
            add(new Date(), {
                years: 1,
            })
        ),
        IDToken: 'id_token_value',
    };
};

// TODO - this does not really do anything because we hardcode
//   the username down below on the MockAuthProvider. However,
//   this will be needed in the future so leaving the work so far
//   so we can leverage this when wanting to test the "on load auth"
//   functionality
const loginAsUser = (username: string) => {
    auth.saveToken(getMockTokenReduced(username));
};

const logoutUser = () => {
    auth.removeToken();
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
    username: string | null;
}
const MockAuthProvider = ({ children, username }: MockAuthProps) => {
    const value = {
        login: jest.fn(() => {
            if (username) {
                loginAsUser(username);
            }
            return Promise.resolve();
        }),
        logout: jest.fn(() => {
            logoutUser();
            return Promise.resolve();
        }),
        user: username ? getMockTokenReduced(username) : null,
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
            <MockAuthProvider username={user ?? null}>
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
