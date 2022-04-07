import ConfirmationModalContextProvider from 'context/Confirmation';
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
                <UserProvider>
                    <ThemeProvider>
                        <AppRouter>
                            <ConfirmationModalContextProvider>
                                {children}
                            </ConfirmationModalContextProvider>
                        </AppRouter>
                    </ThemeProvider>
                </UserProvider>
            </ClientProvider>
        </ContentProvider>
    );
};

export default AppProviders;
