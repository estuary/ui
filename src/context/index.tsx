import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import IconoirProvider from 'context/Iconoir';
import NotificationProvider from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ClientProvider from 'context/Client';
import ThemeProvider from 'context/Theme';
import ContentProvider from 'context/Content';
import { SidePanelDocsProvider } from 'context/SidePanelDocs';
import { TableSettingsProvider } from 'context/TableSettings';
import { UserContextProvider } from './UserContext';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <ThemeProvider>
                <IconoirProvider>
                    <ErrorBoundryWrapper>
                        <ClientProvider>
                            <NotificationProvider>
                                <SwrConfigProvider>
                                    <UserContextProvider>
                                        <SidePanelDocsProvider>
                                            <TableSettingsProvider>
                                                {children}
                                            </TableSettingsProvider>
                                        </SidePanelDocsProvider>
                                    </UserContextProvider>
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
