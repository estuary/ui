import { AuthProvider } from './Auth';
import AppContent from './Content';
import AppRouter from './Router';
import AppTheme from './Theme';

const AppProviders: React.FC = ({ children }) => {
    return (
        <AppContent>
            <AuthProvider>
                <AppTheme>
                    <AppRouter>{children}</AppRouter>
                </AppTheme>
            </AuthProvider>
        </AppContent>
    );
};

export default AppProviders;
