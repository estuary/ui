import Notifications from 'context/Notifications';
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
            <ThemeProvider>
                <ClientProvider>
                    <AppRouter>
                        <Notifications>
                            <SwrConfigProvider>
                                <UserProvider>{children}</UserProvider>
                            </SwrConfigProvider>
                        </Notifications>
                    </AppRouter>
                </ClientProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

export default AppProviders;
