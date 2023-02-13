import IconoirProvider from 'context/Iconoir';
import Notifications from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
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
                        <Notifications>
                            <SwrConfigProvider>
                                <UserProvider>{children}</UserProvider>
                            </SwrConfigProvider>
                        </Notifications>
                    </ClientProvider>
                </IconoirProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

export default AppProviders;
