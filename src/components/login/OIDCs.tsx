import { Box, Stack } from '@mui/material';
import { Provider } from '@supabase/supabase-js';
import { useClient } from 'hooks/supabase-swr';
import { useSnackbar } from 'notistack';
import GoogleButton from 'react-google-button';
import { useIntl } from 'react-intl';
import GithubButton from './GithubButton';

// TODO (routes) This is hardcoded because unauthenticated routes... (same as MagicLink)

interface Props {
    isRegister?: boolean;
    redirectTo: string;
}

function OIDCs({ isRegister, redirectTo }: Props) {
    const supabaseClient = useClient();
    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();

    const loginFailed = (key: Provider) => {
        enqueueSnackbar(
            intl.formatMessage({
                id: `login.${
                    isRegister ? 'registerFailed' : 'loginFailed'
                }.${key}`,
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
                <GithubButton
                    isRegister={isRegister}
                    login={() => login('github')}
                />
            </Box>
            <Box>
                <GoogleButton
                    label={intl.formatMessage({
                        id: isRegister
                            ? 'cta.register.google'
                            : 'cta.login.google',
                    })}
                    onClick={() => login('google')}
                />
            </Box>
        </Stack>
    );
}

export default OIDCs;
