import { Box, Stack } from '@mui/material';
import { Provider } from '@supabase/supabase-js';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import useLoginRedirectPath from 'hooks/useLoginRedirectPath';
import { useSnackbar } from 'notistack';
import GoogleButton from 'react-google-button';
import { useIntl } from 'react-intl';
import GithubButton from './GithubButton';

// TODO (routes) This is hardcoded because unauthenticated routes... (same as MagicLink)
const redirectToBase = `${window.location.origin}/auth`;

interface Props {
    isRegister?: boolean;
    grantToken?: string;
}

function OIDCs({ isRegister, grantToken }: Props) {
    const supabaseClient = useClient();
    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();
    const redirectTo = useLoginRedirectPath(redirectToBase);

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
        const redirectBaseURL = isRegister
            ? window.location.origin
            : redirectTo;

        try {
            const { error } = await supabaseClient.auth.signIn(
                {
                    provider,
                },
                {
                    redirectTo: grantToken
                        ? `${redirectBaseURL}?${GlobalSearchParams.GRANT_TOKEN}=${grantToken}`
                        : redirectBaseURL,
                    shouldCreateUser: isRegister,
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
