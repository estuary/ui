import ConfirmationModalContextProvider from 'context/Confirmation';
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
                <SwrConfigProvider>
                    <UserProvider>
                        <ThemeProvider>
                            <AppRouter>
                                <ConfirmationModalContextProvider>
                                    {children}
                                </ConfirmationModalContextProvider>
                            </AppRouter>
                        </ThemeProvider>
                    </UserProvider>
                </SwrConfigProvider>
            </ClientProvider>
        </ContentProvider>
    );
};

export default AppProviders;
