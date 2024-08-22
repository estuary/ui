import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import IconoirProvider from 'context/Iconoir';
import NotificationProvider from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ThemeProvider from 'context/Theme';
import ContentProvider from 'context/Content';
import { SidePanelDocsProvider } from 'context/SidePanelDocs';
import { TableSettingsProvider } from 'context/TableSettings';
import { UserStoreProvider } from './User';
import GlobalProviders from './GlobalProviders';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <ThemeProvider>
                <IconoirProvider>
                    <ErrorBoundryWrapper>
                        <NotificationProvider>
                            <SwrConfigProvider>
                                <UserStoreProvider>
                                    <GlobalProviders>
                                        <SidePanelDocsProvider>
                                            <TableSettingsProvider>
                                                {children}
                                            </TableSettingsProvider>
                                        </SidePanelDocsProvider>
                                    </GlobalProviders>
                                </UserStoreProvider>
                            </SwrConfigProvider>
                        </NotificationProvider>
                    </ErrorBoundryWrapper>
                </IconoirProvider>
            </ThemeProvider>
        </ContentProvider>
    );
};

export default AppProviders;
