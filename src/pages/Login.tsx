import { Card, CardContent, Grid, Typography } from '@mui/material';
import { Auth } from '@supabase/ui';
import Topbar from 'components/header/Topbar';
import { useClient } from 'hooks/supabase-swr';
import { FormattedMessage } from 'react-intl';
import { getLoginSettings } from 'utils/env-utils';

const Login = () => {
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
                            redirectTo={window.location.origin}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Login;
