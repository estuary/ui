import { BaseComponentProps } from 'types';

import { Navigate, useLocation } from 'react-router-dom';

import { Auth } from '@supabase/ui';

import { unauthenticatedRoutes } from 'app/routes';

import useLoginRedirectPath from 'hooks/useLoginRedirectPath';

import { logRocketConsole } from 'services/logrocket';

interface Props extends BaseComponentProps {
    firstLoad?: boolean;
}

function RequireAuth({ children, firstLoad }: Props) {
    const { user } = Auth.useUser();
    const location = useLocation();
    const redirectTo = useLoginRedirectPath();

    if (user && firstLoad) {
        // When first load, we want to redirect where we need to go
        logRocketConsole('RequireAuth : Navigate : redirectTo', {
            to: redirectTo,
        });
        return <Navigate to={redirectTo} replace />;
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
