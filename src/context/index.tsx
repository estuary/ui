import { AuthProvider } from './Auth';
import AppContent from './Content';
import AppRouter from './Router';
import AppTheme from './Theme';

const AppProviders: React.FC = ({ children }) => {
    return (
        <AuthProvider>
            <AppTheme>
                <AppContent>
                    <AppRouter>{children}</AppRouter>
                </AppContent>
            </AppTheme>
        </AuthProvider>
    );
};

export default AppProviders;
