import { Alert, Box, Snackbar, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import { logoutRoutes } from 'app/Unauthenticated';
import FullPageDialog from 'components/fullPage/Dialog';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import useConstant from 'use-constant';
import { getLoginSettings } from 'utils/env-utils';

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
                <>
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
                </>
            </FullPageDialog>
        </>
    );
};

export default Login;
