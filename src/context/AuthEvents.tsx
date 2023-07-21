import { BaseComponentProps } from 'types';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';

import { unauthenticatedRoutes } from 'app/routes';

import { useClient } from 'hooks/supabase-swr';

import { logRocketConsole } from 'services/logrocket';

function AuthEvents({ children }: BaseComponentProps) {
    const supabaseClient = useClient();
    const navigate = useNavigate();

    useEffectOnce(() => {
        supabaseClient.auth.onAuthStateChange((event) => {
            logRocketConsole('AuthEvents : onAuthStateChange', { event });
            if (event === 'SIGNED_OUT') {
                // Need to use navigate here otherwise the RequireAuth code
                //  would pick up the user logged out and handle the redirecting
                //  to the login page.
                navigate(unauthenticatedRoutes.logout.path, {
                    replace: true,
                });
            }
        });
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default AuthEvents;
