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
        // When first load, we want to redirect where we need to go
        return <Navigate to={redirectTo} replace />;
    }

    if (!user && !firstLoad) {
        // When not first load and no user, go to login with the location where the user wants to go
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

// This includes some Guards as well as the contexts we only ever want
//      loaded when a user is logged in.
export function AuthenticatedOnlyContext({ children }: BaseComponentProps) {
    return (
        <RequireAuth>
            <Osano>
                <QueryParamProvider>
                    <ZustandProvider>
                        <AppGuards>
                            <AuthEvents>
                                <PreFetchDataProvider>
                                    <ConfirmationModalContextProvider>
                                        {children}
                                    </ConfirmationModalContextProvider>
                                </PreFetchDataProvider>
                            </AuthEvents>
                        </AppGuards>
                    </ZustandProvider>
                </QueryParamProvider>
            </Osano>
        </RequireAuth>
    );
}
