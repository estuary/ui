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

    if (!user && !firstLoad) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
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
