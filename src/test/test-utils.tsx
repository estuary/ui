import { ReactElement } from 'react';
import { render, RenderOptions } from 'test/test-utils';
import ContentProvider from 'context/Content';
import IconoirProvider from 'context/Iconoir';
import ThemeProvider from 'context/Theme';
import { BrowserRouter } from 'react-router-dom';

const AllTheProviders = ({ children }: { children: ReactElement }) => {
    return (
        <ContentProvider>
            <ThemeProvider>
                <IconoirProvider>
                    <BrowserRouter>{children}</BrowserRouter>
                </IconoirProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

const customRender = (ui: ReactElement, options?: RenderOptions): any =>
    render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
