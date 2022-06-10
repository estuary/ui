import { Auth } from '@supabase/ui';
import { logoutRoutes } from 'app/Unauthenticated';
import { useClient } from 'hooks/supabase-swr';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';

export const UserProvider = ({ children }: BaseComponentProps) => {
    const supabaseClient = useClient();
    const navigate = useNavigate();
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    useEffectOnce(() => {
        supabaseClient.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                enqueueSnackbar(
                    intl.formatMessage({
                        id: 'login.passwordReset',
                    }),
                    {
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                        variant: 'info',
                    }
                );
            } else if (event === 'SIGNED_OUT') {
                navigate(logoutRoutes.path, { replace: true });
            }
        });
    });

    return (
        <Auth.UserContextProvider supabaseClient={supabaseClient}>
            {children}
        </Auth.UserContextProvider>
    );
};
