import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import { useAuth } from 'auth/Context';
import Topbar from 'components/header/Topbar';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation() as any;
    const auth = useAuth();
    const intl = useIntl();

    const [userName, setUserName] = useState('');

    const from = location.state?.from?.pathname || '/';

    const handleChange = (event: any) => {
        setUserName(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        auth.signin(userName, () => {
            const navigateTo = from === '/' ? '/dashboard' : from;
            navigate(navigateTo, { replace: true });
        });
    };

    return (
        <Grid
            container
            spacing={0}
            direction="column"
            sx={{
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}
        >
            <Topbar isNavigationOpen={false} onNavigationToggle={() => {}} />
            <Grid item xs={3}>
                <Card elevation={24} sx={{ maxWidth: 400 }}>
                    <CardContent>
                        <Typography
                            gutterBottom
                            variant="h6"
                            component="h2"
                            sx={{ textAlign: 'center', paddingTop: '1rem' }}
                        >
                            <FormattedMessage id="productName" />
                        </Typography>
                    </CardContent>
                    <CardContent>
                        <FormattedMessage id="login.main.message" />
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center' }}>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                id="userName"
                                label={intl.formatMessage({
                                    id: 'username.label',
                                })}
                                required
                                fullWidth
                                value={userName}
                                onChange={handleChange}
                            />
                            <Button variant="contained" type="submit">
                                <FormattedMessage id="cta.login" />
                            </Button>
                        </form>
                    </CardActions>
                    <CardContent>
                        <Typography variant="caption" color="initial">
                            <FormattedMessage id="login.help.message" />
                            <NavLink to="/login/help">
                                <FormattedMessage id="cta.clickHere" />
                            </NavLink>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Login;
