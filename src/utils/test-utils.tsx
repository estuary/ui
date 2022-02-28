/* eslint-disable @typescript-eslint/unbound-method */
// https://testing-library.com/docs/react-testing-library/setup#custom-render

import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { localStorageKey } from '../auth';
import AppProviders from '../context';

const loginAsUser = (userName: string = 'fakeUserName') => {
    window.localStorage.setItem(localStorageKey, userName);
};

const logoutUser = () => {
    window.localStorage.removeItem(localStorageKey);
};

const goTo = (route?: string, name?: string) => {
    window.history.pushState(
        {},
        name ? name : 'Test page',
        route ? route : '/'
    );
};

// const waitForLoadingToFinish = () =>
//     waitForElementToBeRemoved(screen.queryAllByText(/loading/i));

const customRender = async (
    ui: ReactElement,
    options: Omit<RenderOptions, 'wrapper'> & {
        route?: string;
        user?: string;
    }
) => {
    const { route, user } = options;
    if (user) {
        loginAsUser(user);
    }

    goTo(route, 'Test Page');

    // TODO - this does not work so all the tests are wrapped in their own awaits.
    //  eventually it would be great if this worked and we didn't need to have that
    //  code duplicated all over the place.
    // if (wait) {
    //     await waitForLoadingToFinish();
    // }

    return rtlRender(ui, { wrapper: AppProviders, ...options });
};

export { goTo, loginAsUser, logoutUser, customRender };
