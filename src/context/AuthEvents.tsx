import { unauthenticatedRoutes } from 'app/routes';
import { useClient } from 'hooks/supabase-swr';
import { useNavigate } from 'react-router-dom';
import { useEffectOnce, useLocalStorage } from 'react-use';
import { logRocketConsole } from 'services/logrocket';
import { BaseComponentProps } from 'types';
import { LocalStorageKeys } from 'utils/localStorage-utils';

function AuthEvents({ children }: BaseComponentProps) {
    const supabaseClient = useClient();
    const navigate = useNavigate();
    const [tokenInvalid] = useLocalStorage(LocalStorageKeys.TOKEN_INVALID);

    useEffectOnce(() => {
        supabaseClient.auth.onAuthStateChange((event) => {
            logRocketConsole('AuthEvents : onAuthStateChange', { event });
            if (event === 'SIGNED_OUT') {
                // Need to use navigate here otherwise the RequireAuth code
                //  would pick up the user logged out and handle the redirecting
                //  to the login page.
                navigate(unauthenticatedRoutes.logout.path, {
                    replace: true,
                    state: Boolean(tokenInvalid)
                        ? {
                              from: window.location,
                          }
                        : undefined,
                });
            }
        });
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default AuthEvents;
