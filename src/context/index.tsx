import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import IconoirProvider from 'context/Iconoir';
import NotificationProvider from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ClientProvider from 'context/Client';
import ThemeProvider from 'context/Theme';
import { UserProvider } from 'context/User';
import ContentProvider from 'context/Content';
import { SidePanelDocsProvider } from 'context/SidePanelDocs';
import { TableSettingsProvider } from 'context/TableSettings';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <ThemeProvider>
                <IconoirProvider>
                    <ErrorBoundryWrapper>
                        <ClientProvider>
                            <NotificationProvider>
                                <SwrConfigProvider>
                                    <UserProvider>
                                        <SidePanelDocsProvider>
                                            <TableSettingsProvider>
                                                {children}
                                            </TableSettingsProvider>
                                        </SidePanelDocsProvider>
                                    </UserProvider>
                                </SwrConfigProvider>
                            </NotificationProvider>
                        </ClientProvider>
                    </ErrorBoundryWrapper>
                </IconoirProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

export default AppProviders;
