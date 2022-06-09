import { Box } from '@mui/material';
import { Provider } from '@supabase/supabase-js';
import { useClient } from 'hooks/supabase-swr';
import { useSnackbar } from 'notistack';
import GoogleButton from 'react-google-button';
import { useIntl } from 'react-intl';
import useConstant from 'use-constant';

function OIDCs() {
    const redirectTo = useConstant(
        () => `${window.location.origin}` // `${window.location.origin}${routeDetails.registration.path}`
    );

    const supabaseClient = useClient();
    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();

    const loginFailed = (key: Provider) => {
        enqueueSnackbar(
            intl.formatMessage({
                id: `login.loginFailed.${key}`,
            }),
            {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                preventDuplicate: true,
                variant: 'error',
            }
        );
    };

    const login = async (provider: Provider) => {
        try {
            const { error } = await supabaseClient.auth.signIn(
                {
                    provider,
                },
                {
                    redirectTo,
                }
            );
            if (error) loginFailed(provider);
        } catch (error: unknown) {
            loginFailed(provider);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <GoogleButton onClick={() => login('google')} />
        </Box>
    );
}

export default OIDCs;
