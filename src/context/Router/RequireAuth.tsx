import { Auth } from '@supabase/ui';
import { authenticatedRoutes, unauthenticatedRoutes } from 'app/routes';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useLoginRedirectPath from 'hooks/useLoginRedirectPath';
import { Navigate, useLocation } from 'react-router-dom';
import { logRocketConsole } from 'services/logrocket';
import { BaseComponentProps } from 'types';
import { getPathWithParams } from 'utils/misc-utils';

interface Props extends BaseComponentProps {
    firstLoad?: boolean;
    login?: boolean;
}

function RequireAuth({ children, firstLoad, login }: Props) {
    const { user } = Auth.useUser();
    const location = useLocation();
    const redirectTo = useLoginRedirectPath();
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

    if (user && firstLoad) {
        // This should handle when an already logged in user visits an access grant link
        const to =
            login && grantToken
                ? getPathWithParams(authenticatedRoutes.home.path, {
                      grantToken,
                  })
                : redirectTo;

        // When first load, we want to redirect where we need to go
        logRocketConsole('RequireAuth : Navigate : redirectTo', {
            to,
        });
        return <Navigate to={to} replace />;
    }

    if (!user && !firstLoad) {
        // When not first load and no user, go to login with the location where the user wants to go
        logRocketConsole('RequireAuth : Navigate : login', {
            to: unauthenticatedRoutes.login.path,
            from: location,
        });
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

export default RequireAuth;
