import { Box, Stack } from '@mui/material';
import { Provider } from '@supabase/supabase-js';
import { REDIRECT_TO_PARAM_NAME } from 'app/routes';
import { useClient } from 'hooks/supabase-swr';
import { useSnackbar } from 'notistack';
import GoogleButton from 'react-google-button';
import { useIntl } from 'react-intl';
import GithubButton from './GithubButton';

// TODO (routes) This is hardcoded because unauthenticated routes... (same as MagicLink)
const redirectToBase = `${window.location.origin}/auth`;

function OIDCs() {
    const supabaseClient = useClient();
    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();

    const redirectTo = `${redirectToBase}?${REDIRECT_TO_PARAM_NAME}=${encodeURIComponent(
        `${window.location.pathname}${window.location.search}`
    )}`;

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
        <Stack
            spacing={3}
            sx={{
                alignItems: 'center',
            }}
        >
            <Box>
                <GithubButton login={() => login('github')} />
            </Box>
            <Box>
                <GoogleButton onClick={() => login('google')} />
            </Box>
        </Stack>
    );
}

export default OIDCs;
