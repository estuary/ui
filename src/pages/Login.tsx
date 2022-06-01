import { Alert, Box, Snackbar, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import { logoutRoutes } from 'app/Unauthenticated';
import FullPageDialog from 'components/fullPage/Dialog';
import ExternalLink from 'components/shared/ExternalLink';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
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

    return (
        <>
            <Snackbar
                open={reason === LogoutReasons.JWT}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                autoHideDuration={10000}
            >
                <Alert severity="error">
                    Your JWT Token expired. Please login again.
                </Alert>
            </Snackbar>
            <FullPageDialog>
                <Box>
                    <Typography align="center" sx={{ mb: 5 }}>
                        <FormattedMessage id="login.oidc.message" />
                    </Typography>

                    <Box>
                        <Auth
                            providers={['google']}
                            supabaseClient={supabaseClient}
                            socialColors={true}
                            onlyThirdPartyProviders={!loginSettings.showEmail}
                            redirectTo={redirectTo}
                            style={{
                                minWidth: 310,
                                padding: 12,
                                backgroundColor: '#FFFFFF',
                                borderRadius: 10,
                            }}
                        />
                    </Box>

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
