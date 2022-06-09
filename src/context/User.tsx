import { Auth } from '@supabase/ui';
import { routeDetails } from 'app/Authenticated';
import { logoutRoutes } from 'app/Unauthenticated';
import { useClient } from 'hooks/supabase-swr';
import { useNavigate } from 'react-router';
import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';

export const UserProvider = ({ children }: BaseComponentProps) => {
    const supabaseClient = useClient();
    const navigate = useNavigate();

    useEffectOnce(() => {
        supabaseClient.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate(routeDetails.user.passwordReset.fullPath);
            } else if (event === 'SIGNED_OUT') {
                navigate(logoutRoutes.path);
            }
        });
    });

    return (
        <Auth.UserContextProvider supabaseClient={supabaseClient}>
            {children}
        </Auth.UserContextProvider>
    );
};
