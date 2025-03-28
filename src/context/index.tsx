import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import IconoirProvider from 'src/context/Iconoir';
import NotificationProvider from 'src/context/Notifications';
import SwrConfigProvider from 'src/context/SWR';
import { BaseComponentProps } from 'src/types';
import ThemeProvider from 'src/context/Theme';
import ContentProvider from 'src/context/Content';
import { SidePanelDocsProvider } from 'src/context/SidePanelDocs';
import { TableSettingsProvider } from 'src/context/TableSettings';
import { UserStoreProvider } from './User';
import GlobalProviders from './GlobalProviders';
import { UpdateHelmetProvider } from './UpdateHelmet';

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
