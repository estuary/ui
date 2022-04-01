import ConfirmationModalContextProvider from 'context/Confirmation';
import { BaseComponentProps } from 'types';
import AppContent from './Content';
import AppRouter from './Router';
import AppTheme from './Theme';

const AppProviders = ({ children }: BaseComponentProps) => {
    return (
        <AppContent>
            <AppTheme>
                <AppRouter>
                    <ConfirmationModalContextProvider>
                        {children}
                    </ConfirmationModalContextProvider>
                </AppRouter>
            </AppTheme>
        </AppContent>
    );
};

export default AppProviders;
