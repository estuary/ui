import { Auth } from '@supabase/ui';
import AppGuards from 'app/guards';
import ConfirmationModalContextProvider from 'context/Confirmation';
import { ZustandProvider } from 'context/Zustand/provider';
import { Navigate, useLocation } from 'react-router-dom';
import { BaseComponentProps } from 'types';
import AuthEvents from './AuthEvents';
import PreFetchDataProvider from './fetcher';
import Osano from './Osano';
import QueryParamProvider from './QueryParam';

interface Props extends BaseComponentProps {
    firstLoad?: boolean;
}

export function RequireAuth({ children, firstLoad }: Props) {
    const { user } = Auth.useUser();
    const location = useLocation();

    console.log('require auth', user);

    if (user && firstLoad) {
        // Redirect to the welcome page if landed on the login page while logged in
        return <Navigate to="/welcome" replace />;
    }

    if (!user && !firstLoad) {
        // Redirect to login with the current URL requested if no user
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

// This is for contexts that should only be added to the app after the user has authenticated
export function AuthenticatedOnlyContext({ children }: BaseComponentProps) {
    return (
        <RequireAuth>
            <Osano>
                <QueryParamProvider>
                    <AppGuards>
                        <AuthEvents>
                            <PreFetchDataProvider>
                                <ZustandProvider>
                                    <ConfirmationModalContextProvider>
                                        {children}
                                    </ConfirmationModalContextProvider>
                                </ZustandProvider>
                            </PreFetchDataProvider>
                        </AuthEvents>
                    </AppGuards>
                </QueryParamProvider>
            </Osano>
        </RequireAuth>
    );
}
