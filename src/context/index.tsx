import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ClientProvider from './Client';
import ContentProvider from './Content';
import AppRouter from './Router';
import ThemeProvider from './Theme';
import { UserProvider } from './User';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <ClientProvider>
                <AppRouter>
                    <SwrConfigProvider>
                        <UserProvider>
                            <ThemeProvider>{children}</ThemeProvider>
                        </UserProvider>
                    </SwrConfigProvider>
                </AppRouter>
            </ClientProvider>
        </ContentProvider>
    );
};

export default AppProviders;
