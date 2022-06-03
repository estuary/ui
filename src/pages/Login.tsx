import { Box, Divider, Stack, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import { logoutRoutes } from 'app/Unauthenticated';
import FullPageDialog from 'components/fullPage/Dialog';
import LoginNotifications from 'components/login/Notifications';
import OIDCs from 'components/login/OIDCs';
import ExternalLink from 'components/shared/ExternalLink';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { getLoginSettings, getUrls } from 'utils/env-utils';
import { removeGatewayAuthConfig } from 'utils/localStorage-utils';

export enum LogoutReasons {
    JWT = 'jwt_expired',
}
const urls = getUrls();

const Login = () => {
    useBrowserTitle('browserTitle.login');

    removeGatewayAuthConfig();

    const [searchParams] = useSearchParams();
    const reason = searchParams.get(logoutRoutes.params.reason);

    const supabaseClient = useClient();
    const loginSettings = getLoginSettings();

    // TODO (notification manager) We should realy make a stand alone component to handle all possible notifications
    const [notificationMessage, setNotificationMessage] = useState<
        string | undefined
    >(reason === LogoutReasons.JWT ? 'login.jwtExpired' : undefined);

    return (
        <>
            <LoginNotifications notificationMessage={notificationMessage} />
            <FullPageDialog>
                <Box>
                    <Typography align="center" sx={{ mb: 4 }}>
                        <FormattedMessage id="login.oidc.message" />
                    </Typography>

                    <Stack direction="column" spacing={2}>
                        <Box>
                            <OIDCs onError={setNotificationMessage} />
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
