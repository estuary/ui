import { Auth } from '@supabase/ui';
import { routeDetails } from 'app/Authenticated';
import { useClient } from 'hooks/supabase-swr';
import { useNavigate } from 'react-router';
import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';

export const UserProvider = ({ children }: BaseComponentProps) => {
    const supabaseClient = useClient();
    const navigate = useNavigate();

    useEffectOnce(() => {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed', { event, session });
            if (event === 'PASSWORD_RECOVERY') {
                navigate(routeDetails.user.passwordReset.fullPath);
            }
        });
    });

    return (
        <Auth.UserContextProvider supabaseClient={supabaseClient}>
            {children}
        </Auth.UserContextProvider>
    );
};
