import type { BaseComponentProps } from 'src/types';

import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import ContentProvider from 'src/context/Content';
import GlobalProviders from 'src/context/GlobalProviders';
import IconoirProvider from 'src/context/Iconoir';
import NotificationProvider from 'src/context/Notifications';
import { PHProvider } from 'src/context/PostHog';
import { SidePanelDocsProvider } from 'src/context/SidePanelDocs';
import SwrConfigProvider from 'src/context/SWR';
import { TableSettingsProvider } from 'src/context/TableSettings';
import ThemeProvider from 'src/context/Theme';
import { UpdateHelmetProvider } from 'src/context/UpdateHelmet';
import UrqlConfigProvider from 'src/context/URQL';
import { UserStoreProvider } from 'src/context/User';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <UpdateHelmetProvider>
                <PHProvider>
                    <ThemeProvider>
                        <IconoirProvider>
                            <ErrorBoundryWrapper>
                                <NotificationProvider>
                                    <SwrConfigProvider>
                                        <UrqlConfigProvider>
                                            <UserStoreProvider>
                                                <GlobalProviders>
                                                    <SidePanelDocsProvider>
                                                        <TableSettingsProvider>
                                                            {children}
                                                        </TableSettingsProvider>
                                                    </SidePanelDocsProvider>
                                                </GlobalProviders>
                                            </UserStoreProvider>
                                        </UrqlConfigProvider>
                                    </SwrConfigProvider>
                                </NotificationProvider>
                            </ErrorBoundryWrapper>
                        </IconoirProvider>
                    </ThemeProvider>
                </PHProvider>
            </UpdateHelmetProvider>
        </ContentProvider>
    );
};

export default AppProviders;
