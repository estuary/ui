import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import Topbar from 'components/header/Topbar';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAuth } from '../context/Auth';

const showLocal = process.env.REACT_APP_SHOW_LOCAL_LOGIN === 'true';
const showOIDC = process.env.REACT_APP_SHOW_OIDC_LOGIN === 'true';
const showGoogle = process.env.REACT_APP_SHOW_OIDC_LOGIN_GOOGLE === 'true';

const Login = () => {
    const [userName, setUserName] = useState('');
    const intl = useIntl();
    const { login } = useAuth();

    const AUTH_URL = window.Estuary?.auth_url
        ? window.Estuary.auth_url
        : process.env.REACT_APP_AUTH_BASE_URL;

    const handlers = {
        change: (event: React.ChangeEvent<HTMLInputElement>) => {
            setUserName(event.target.value);
        },
        submit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            await login(userName);
        },
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

                    {showLocal ? (
                        <>
                            <CardContent>
                                <FormattedMessage id="login.local.message" />
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center' }}>
                                <form onSubmit={handlers.submit}>
                                    <TextField
                                        id="userName"
                                        label={intl.formatMessage({
                                            id: 'username.label',
                                        })}
                                        required
                                        fullWidth
                                        value={userName}
                                        onChange={handlers.change}
                                    />
                                    <Button variant="contained" type="submit">
                                        <FormattedMessage id="cta.login" />
                                    </Button>
                                </form>
                            </CardActions>
                        </>
                    ) : null}

                    {showOIDC ? (
                        <>
                            <CardContent>
                                <FormattedMessage id="login.oidc.message" />
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center' }}>
                                {showGoogle ? (
                                    <Button
                                        href={`${AUTH_URL}/auth/google?next=${window.location.href}`}
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
