import {
    Alert,
    Card,
    CardContent,
    Grid,
    Snackbar,
    Typography,
} from '@mui/material';
import { Auth } from '@supabase/ui';
import { logoutRoutes } from 'app/Unauthenticated';
import Topbar from 'components/header/Topbar';
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
        <Grid
            container
            spacing={0}
            direction="column"
            sx={{
                alignItems: 'center',
                height: '100vh',
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
            <Topbar isNavigationOpen={false} />
            <Grid item xs={3}>
                <Card elevation={24} sx={{ maxWidth: 400, minHeight: 300 }}>
                    <CardContent>
                        <Typography
                            gutterBottom
                            variant="h6"
                            component="h2"
                            sx={{ paddingTop: '1rem', textAlign: 'center' }}
                        >
                            <FormattedMessage id="productName" />
                        </Typography>
                    </CardContent>

                    <CardContent>
                        <FormattedMessage id="login.oidc.message" />
                    </CardContent>
                    <CardContent>
                        <Auth
                            providers={['google']}
                            supabaseClient={supabaseClient}
                            socialColors={true}
                            onlyThirdPartyProviders={!loginSettings.showEmail}
                            redirectTo={redirectTo}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Login;
