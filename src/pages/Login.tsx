import { Alert, Box, Paper, Snackbar, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import { logoutRoutes } from 'app/Unauthenticated';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import useConstant from 'use-constant';
import { getLoginSettings } from 'utils/env-utils';
import lightLogo from '../images/light-horizontal/estuary-logo-light.png';

export enum LogoutReasons {
    JWT = 'jwt_expired',
}

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
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                my: 6,
            }}
        >
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

            <Paper
                sx={{
                    minWidth: 360,
                    maxHeight: 750,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    background:
                        'linear-gradient(159.03deg, rgba(172, 199, 220, 0.18) 2.23%, rgba(172, 199, 220, 0.12) 40.69%)',
                    boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.2)',
                    borderRadius: 5,
                }}
            >
                <img
                    src={lightLogo}
                    style={{ marginBottom: 16 }}
                    width={200}
                    alt="Estuary Logo"
                />

                <Typography sx={{ mb: 5 }}>
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
            </Paper>
        </Box>
    );
};

export default Login;
