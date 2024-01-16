import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import IconoirProvider from 'context/Iconoir';
import NotificationProvider from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ClientProvider from './Client';
import ContentProvider from './Content';
import { SidePanelDocsProvider } from './SidePanelDocs';
import { TableSettingsProvider } from './TableSettings';
import ThemeProvider from './Theme';
import { UserProvider } from './User';

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
