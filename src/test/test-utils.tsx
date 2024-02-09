import { ReactElement } from 'react';
import ContentProvider from 'context/Content';
import IconoirProvider from 'context/Iconoir';
import ThemeProvider from 'context/Theme';
import { BrowserRouter } from 'react-router-dom';
import { RenderOptions } from '@testing-library/react';

export const AllTheProviders = ({ children }: { children: ReactElement }) => {
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

export const renderOps: RenderOptions = {
    wrapper: AllTheProviders,
};
