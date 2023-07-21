import { BaseComponentProps } from 'types';

import IconoirProvider from 'context/Iconoir';
import NotificationProvider from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';

import ClientProvider from './Client';
import ContentProvider from './Content';
import ThemeProvider from './Theme';
import { UserProvider } from './User';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <ThemeProvider>
                <IconoirProvider>
                    <ClientProvider>
                        <NotificationProvider>
                            <SwrConfigProvider>
                                <UserProvider>{children}</UserProvider>
                            </SwrConfigProvider>
                        </NotificationProvider>
                    </ClientProvider>
                </IconoirProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

export default AppProviders;
