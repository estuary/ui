import IconoirProvider from 'context/Iconoir';
import NotificationProvider from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ClientProvider from './Client';
import ContentProvider from './Content';
import NetworkWarning from './NetworkWarning';
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
                                <NetworkWarning>
                                    <UserProvider>{children}</UserProvider>
                                </NetworkWarning>
                            </SwrConfigProvider>
                        </NotificationProvider>
                    </ClientProvider>
                </IconoirProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

export default AppProviders;
