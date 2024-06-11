import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import IconoirProvider from 'context/Iconoir';
import NotificationProvider from 'context/Notifications';
import SwrConfigProvider from 'context/SWR';
import { BaseComponentProps } from 'types';
import ThemeProvider from 'context/Theme';
import ContentProvider from 'context/Content';
import { SidePanelDocsProvider } from 'context/SidePanelDocs';
import { TableSettingsProvider } from 'context/TableSettings';
import SupabaseProvider from './Supabase';
import { UserStoreProvider } from './User';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <ContentProvider>
            <ThemeProvider>
                <IconoirProvider>
                    <ErrorBoundryWrapper>
                        <NotificationProvider>
                            <SwrConfigProvider>
                                <UserStoreProvider>
                                    <SupabaseProvider>
                                        <SidePanelDocsProvider>
                                            <TableSettingsProvider>
                                                {children}
                                            </TableSettingsProvider>
                                        </SidePanelDocsProvider>
                                    </SupabaseProvider>
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
