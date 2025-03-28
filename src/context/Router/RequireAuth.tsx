import { Navigate, useLocation } from 'react-router-dom';

import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';
import { useUserStore } from 'src/context/User/useUserContextStore';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import useLoginRedirectPath from 'src/hooks/searchParams/useLoginRedirectPath';
import { logRocketConsole } from 'src/services/shared';
import type { BaseComponentProps } from 'src/types';
import { getPathWithParams } from 'src/utils/misc-utils';

interface Props extends BaseComponentProps {
    firstLoad?: boolean;
    checkForGrant?: boolean;
}

function RequireAuth({ children, firstLoad, checkForGrant }: Props) {
    const user = useUserStore((state) => state.user);

    const location = useLocation();
    const redirectTo = useLoginRedirectPath();
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

    if (user && firstLoad) {
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
