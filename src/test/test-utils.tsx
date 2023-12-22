import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
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

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
