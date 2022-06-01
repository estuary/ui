import {
    Alert,
    Box,
    Divider,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material';
import { Auth } from '@supabase/ui';
import { logoutRoutes } from 'app/Unauthenticated';
import FullPageDialog from 'components/fullPage/Dialog';
import ExternalLink from 'components/shared/ExternalLink';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useState } from 'react';
import GoogleButton from 'react-google-button';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import useConstant from 'use-constant';
import { getLoginSettings, getUrls } from 'utils/env-utils';

export enum LogoutReasons {
    JWT = 'jwt_expired',
}
const urls = getUrls();

const Login = () => {
    useBrowserTitle('browserTitle.login');

    const [searchParams] = useSearchParams();
    const reason = searchParams.get(logoutRoutes.params.reason);

    const redirectTo = useConstant(
        () => `${window.location.origin}` // `${window.location.origin}${routeDetails.registration.path}`
    );
    const supabaseClient = useClient();
    const loginSettings = getLoginSettings();

    // TODO (notification manager) We should realy make a stand alone component to handle all possible notifications
    const [notificationMessage, setNotificationMessage] = useState<
        string | undefined
    >(reason === LogoutReasons.JWT ? 'login.jwtExpired' : undefined);

    // TODO (auth) We need to get the logins configurable again now that we'll be using custom buttons
    const handlers = {
        google: async () => {
            const response = await supabaseClient.auth.signIn(
                {
                    provider: 'google',
                },
                {
                    redirectTo,
                }
            );
            if (response.error) {
                setNotificationMessage('login.loginFailed.google');
            }
        },
    };

    return (
        <>
            <Snackbar
                open={notificationMessage !== undefined}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                autoHideDuration={10000}
            >
                <Alert severity="error">
                    <FormattedMessage id={notificationMessage} />
                </Alert>
            </Snackbar>
            <FullPageDialog>
                <Box>
                    <Typography align="center" sx={{ mb: 4 }}>
                        <FormattedMessage id="login.oidc.message" />
                    </Typography>

                    <Stack direction="column" spacing={2}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <GoogleButton onClick={handlers.google} />
                        </Box>

                        <Divider flexItem>
                            <FormattedMessage id="login.separator" />
                        </Divider>

                        <Box>
                            <Auth
                                providers={[]}
                                supabaseClient={supabaseClient}
                                onlyThirdPartyProviders={
                                    !loginSettings.showEmail
                                }
                                redirectTo={redirectTo}
                                style={{
                                    minWidth: 310,
                                    padding: 12,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 10,
                                }}
                            />
                        </Box>
                    </Stack>

                    <Typography align="center" sx={{ mt: 4 }}>
                        <FormattedMessage
                            id="login.documentAcknowledgement"
                            values={{
                                privacy: (
                                    <ExternalLink
                                        hideIcon
                                        link={urls.privacyPolicy}
                                    >
                                        <FormattedMessage id="register.label.documentAcknowledgement.privacy" />
                                    </ExternalLink>
                                ),
                                terms: (
                                    <ExternalLink
                                        hideIcon
                                        link={urls.termsOfService}
                                    >
                                        <FormattedMessage id="register.label.documentAcknowledgement.terms" />
                                    </ExternalLink>
                                ),
                            }}
                        />
                    </Typography>
                </Box>
            </FullPageDialog>
        </>
    );
};

export default Login;
