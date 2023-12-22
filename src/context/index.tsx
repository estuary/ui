import IconoirProvider from 'context/Iconoir';
import NotificationProvider from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import ClientProvider from './Client';
import ContentProvider from './Content';
import { SidePanelDocsProvider } from './SidePanelDocs';
import ThemeProvider from './Theme';
import { UserProvider } from './User';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <ThemeProvider>
                <IconoirProvider>
                    <ClientProvider>
                        <NotificationProvider>
                            <ErrorBoundryWrapper>
                                <SwrConfigProvider>
                                    <UserProvider>
                                        <SidePanelDocsProvider>
                                            {children}
                                        </SidePanelDocsProvider>
                                    </UserProvider>
                                </SwrConfigProvider>
                            </ErrorBoundryWrapper>
                        </NotificationProvider>
                    </ClientProvider>
                </IconoirProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

export default AppProviders;
