import ConfirmationModalContextProvider from 'context/Confirmation';
import { BaseComponentProps } from 'types';
import { AuthProvider } from './Auth';
import AppContent from './Content';
import AppRouter from './Router';
import AppTheme from './Theme';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <AppContent>
            <AuthProvider>
                <AppTheme>
                    <AppRouter>
                        <ConfirmationModalContextProvider>
                            {children}
                        </ConfirmationModalContextProvider>
                    </AppRouter>
                </AppTheme>
            </AuthProvider>
        </AppContent>
    );
};

export default AppProviders;
