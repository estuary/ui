import { unauthenticatedRoutes } from 'app/routes';
import { useClient } from 'hooks/supabase-swr';
import { redirect } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';

function AuthEvents({ children }: BaseComponentProps) {
    const supabaseClient = useClient();
    useEffectOnce(() => {
        supabaseClient.auth.onAuthStateChange((event) => {
            console.log('AuthEvents : onAuthStateChange', { event });
            if (event === 'SIGNED_OUT') {
                redirect(unauthenticatedRoutes.logout.path);
            }
        });
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default AuthEvents;
