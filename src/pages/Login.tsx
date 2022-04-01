import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from '@mui/material';
import { Provider } from '@supabase/supabase-js';
import Topbar from 'components/header/Topbar';
import { FormattedMessage } from 'react-intl';
import { supabase } from 'services/supabase';
import { getLoginSettings } from 'utils/env-utils';

const { showGoogle } = getLoginSettings();

const Login = () => {
    const handleOAuthLogin = async (provider: Provider) => {
        const { error } = await supabase.auth.signIn({ provider });
        if (error) console.log('Error: ', error.message);
    };

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
                    <CardActions sx={{ justifyContent: 'center' }}>
                        {showGoogle ? (
                            <Button
                                onClick={() => handleOAuthLogin('google')}
                                variant="contained"
                                color="success"
                            >
                                <FormattedMessage id="cta.oidc.google" />
                            </Button>
                        ) : null}
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Login;
