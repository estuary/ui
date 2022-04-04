import ConfirmationModalContextProvider from 'context/Confirmation';
import AppData from 'context/Data';
import { BaseComponentProps } from 'types';
import { AuthProvider } from './Auth';
import AppContent from './Content';
import AppRouter from './Router';
import AppTheme from './Theme';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <AppContent>
            <AuthProvider>
                <AppData>
                    <AppTheme>
                        <AppRouter>
                            <ConfirmationModalContextProvider>
                                {children}
                            </ConfirmationModalContextProvider>
                        </AppRouter>
                    </AppTheme>
                </AppData>
            </AuthProvider>
        </AppContent>
    );
};

export default AppProviders;
