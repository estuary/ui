
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import ContentProvider from 'src/context/Content';
import IconoirProvider from 'src/context/Iconoir';
import NotificationProvider from 'src/context/Notifications';
import { SidePanelDocsProvider } from 'src/context/SidePanelDocs';
import SwrConfigProvider from 'src/context/SWR';
import { TableSettingsProvider } from 'src/context/TableSettings';
import ThemeProvider from 'src/context/Theme';
import type { BaseComponentProps } from 'src/types';
import GlobalProviders from 'src/context/GlobalProviders';
import { UserStoreProvider } from 'src/context/User';
import { UpdateHelmetProvider } from 'src/context/UpdateHelmet';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <UpdateHelmetProvider>
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
            </UpdateHelmetProvider>
        </ContentProvider>
    );
};

export default AppProviders;
