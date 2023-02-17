import { Auth } from '@supabase/ui';
import AppGuards from 'app/guards';
import { unauthenticatedRoutes } from 'app/routes';
import ConfirmationModalContextProvider from 'context/Confirmation';
import { ZustandProvider } from 'context/Zustand/provider';
import useLoginRedirectPath from 'hooks/useLoginRedirectPath';
import { Navigate, useLocation } from 'react-router-dom';
import { BaseComponentProps } from 'types';
import AuthEvents from './AuthEvents';
import PreFetchDataProvider from './fetcher';
import Osano from './Osano';
import QueryParamProvider from './QueryParam';

interface Props extends BaseComponentProps {
    firstLoad?: boolean;
}

// TODO (routes) not totaly sure where we want this kinda thing to live
//  in the long term so leaving it here for now.
export function RequireAuth({ children, firstLoad }: Props) {
    const { user } = Auth.useUser();
    const location = useLocation();
    const redirectTo = useLoginRedirectPath();

    if (user && firstLoad) {
        // Redirect to the welcome page if landed on the login page while logged in
        return <Navigate to={redirectTo} replace />;
    }

    if (!user && !firstLoad) {
        // Redirect to login with the current URL requested if no user
        return (
            <Navigate
                to={unauthenticatedRoutes.login.path}
                state={{ from: location }}
                replace
            />
        );
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
