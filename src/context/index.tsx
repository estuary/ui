import IconoirProvider from 'context/Iconoir';
import Notifications from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ClientProvider from './Client';
import ContentProvider from './Content';
import QueryParam from './QueryParam';
import AppRouter from './Router';
import ThemeProvider from './Theme';
import { UserProvider } from './User';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <ThemeProvider>
                <ClientProvider>
                    <Notifications>
                        <SwrConfigProvider>
                            <IconoirProvider>
                                <AppRouter>
                                    <QueryParam>
                                        <UserProvider>{children}</UserProvider>
                                    </QueryParam>
                                </AppRouter>
                            </IconoirProvider>
                        </SwrConfigProvider>
                    </Notifications>
                </ClientProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

export default AppProviders;
