import ConfirmationModalContextProvider from 'context/Confirmation';
import { BaseComponentProps } from 'types';
import { AuthProvider } from './Auth';
import AppContent from './Content';
import AppData from './Data';
import AppRouter from './Router';
import AppTheme from './Theme';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <AppContent>
            <AppData>
                <AuthProvider>
                    <AppTheme>
                        <AppRouter>
                            <ConfirmationModalContextProvider>
                                {children}
                            </ConfirmationModalContextProvider>
                        </AppRouter>
                    </AppTheme>
                </AuthProvider>
            </AppData>
        </AppContent>
    );
};

export default AppProviders;
