import { Card, CardContent, Grid, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import { routeDetails } from 'app/Authenticated';
import Topbar from 'components/header/Topbar';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import useConstant from 'use-constant';
import { getLoginSettings } from 'utils/env-utils';

const Login = () => {
    useBrowserTitle('browserTitle.login');

    const redirectTo = useConstant(
        () => `${window.location.origin}${routeDetails.registration.path}`
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
