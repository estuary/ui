import { Auth } from '@supabase/ui';
import { useClient } from 'hooks/supabase-swr';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useEffectOnce } from 'react-use';
import { BaseComponentProps } from 'types';

export const UserProvider = ({ children }: BaseComponentProps) => {
    const supabaseClient = useClient();
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    useEffectOnce(() => {
        supabaseClient.auth.onAuthStateChange((event) => {
            console.log('UserProvider event', event);
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
            }
        });
    });

    return (
        <Auth.UserContextProvider supabaseClient={supabaseClient}>
            {children}
        </Auth.UserContextProvider>
    );
};
