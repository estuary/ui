// https://testing-library.com/docs/react-testing-library/setup#custom-render

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, type FC } from 'react';
import { act } from 'react-dom/test-utils';
import { localStorageKey } from './auth';
import AppProviders from './context';

const AllTheProviders: FC = ({ children }) => {
    return <AppProviders>{children}</AppProviders>;
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

const loginAsUser = (userName: string = 'fakeUserName') => {
    act(() => {
        window.localStorage.setItem(localStorageKey, userName);
    });
};

export * from '@testing-library/react';
export { customRender as render, loginAsUser };
