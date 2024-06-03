import { authenticatedRoutes, unauthenticatedRoutes } from 'app/routes';
import { useUser } from 'context/UserContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useLoginRedirectPath from 'hooks/searchParams/useLoginRedirectPath';
import { Navigate, useLocation } from 'react-router-dom';
import { logRocketConsole } from 'services/shared';
import { BaseComponentProps } from 'types';
import { getPathWithParams } from 'utils/misc-utils';

interface Props extends BaseComponentProps {
    firstLoad?: boolean;
    checkForGrant?: boolean;
}

function RequireAuth({ children, firstLoad, checkForGrant }: Props) {
    const { session } = useUser();
    const location = useLocation();
    const redirectTo = useLoginRedirectPath();
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

    if (session?.user && firstLoad) {
        // Handles: when an already logged in user visits an access grant link
        //  when a user is coming back from registration
        const to =
            checkForGrant && grantToken
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

    if ((!session || !session.user) && !firstLoad) {
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
