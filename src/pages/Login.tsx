import { Alert, Box, Paper, Snackbar, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import { logoutRoutes } from 'app/Unauthenticated';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import useConstant from 'use-constant';
import { getLoginSettings } from 'utils/env-utils';
import lightLogo from '../images/full-light/estuary-logo-light.png';

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
                    maxHeight: 800,
                    display: 'flex',
                    flexFlow: 'row wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    background:
                        'linear-gradient(179.6deg, rgba(99, 138, 169, 0.24) 0%, rgba(13, 43, 67, 0.2) 76.56%, rgba(13, 43, 67, 0.1) 100%)',
                    boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.2)',
                    borderRadius: 5,
                    backdropFilter: 'blur(20px)',
                }}
            >
                <Box sx={{ mr: 4 }}>
                    <img src={lightLogo} width={400} alt="" />
                </Box>

                <Box>
                    <Box
                        sx={{
                            px: 2,
                            pt: 2,
                            pb: 3,
                            backgroundColor: '#2E5676',
                            borderRadius: '10px 10px 0px 0px',
                        }}
                    >
                        <Typography
                            gutterBottom
                            variant="h6"
                            component="h2"
                            sx={{ textAlign: 'center' }}
                        >
                            <FormattedMessage id="productName" />
                        </Typography>

                        <Typography>
                            <FormattedMessage id="login.oidc.message" />
                        </Typography>
                    </Box>

                    <Box>
                        <Auth
                            providers={['google']}
                            supabaseClient={supabaseClient}
                            socialColors={true}
                            onlyThirdPartyProviders={!loginSettings.showEmail}
                            redirectTo={redirectTo}
                            style={{
                                padding: 16,
                                backgroundColor: '#FFFFFF',
                                borderRadius: '0px 0px 10px 10px',
                            }}
                        />
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;
