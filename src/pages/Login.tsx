import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from '@mui/material';
import Topbar from 'components/header/Topbar';
import { FormattedMessage } from 'react-intl';
import { getAuthPath, getLoginSettings } from 'utils/env-utils';

const { showOIDC, showGoogle } = getLoginSettings();

const Login = () => {
    const AUTH_URL = getAuthPath();
    const GOOGLE_LOGIN_URL = `${AUTH_URL}/auth/google`;
    const nextPath = `?next=${window.location.href}`;

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

                    {showOIDC ? (
                        <>
                            <CardContent>
                                <FormattedMessage id="login.oidc.message" />
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center' }}>
                                {showGoogle ? (
                                    <Button
                                        href={`${GOOGLE_LOGIN_URL}${nextPath}`}
                                        variant="contained"
                                        color="success"
                                    >
                                        <FormattedMessage id="cta.oidc.google" />
                                    </Button>
                                ) : null}
                            </CardActions>
                        </>
                    ) : null}
                </Card>
            </Grid>
        </Grid>
    );
};

export default Login;
