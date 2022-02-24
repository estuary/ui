// https://testing-library.com/docs/react-testing-library/setup#custom-render

import { render, RenderOptions } from '@testing-library/react';
import AppContent from 'AppContent';
import AppRouter from 'AppRouter';
import AppTheme from 'AppTheme';
import AuthProvider from 'auth/Provider';
import { ReactElement, type FC } from 'react';

const AllTheProviders: FC = ({ children }) => {
    return (
        <AppTheme>
            <AppContent>
                <AppRouter>
                    <AuthProvider>{children}</AuthProvider>
                </AppRouter>
            </AppContent>
        </AppTheme>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
