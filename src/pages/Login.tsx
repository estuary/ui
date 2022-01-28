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
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation() as any;
    const auth = useAuth();

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
                            Control Plane
                        </Typography>
                    </CardContent>
                    <CardContent>
                        This isn't a real login form. Whatever username you
                        enter will be used in the UI.
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center' }}>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                id="userName"
                                label="User Name"
                                required
                                fullWidth
                                value={userName}
                                onChange={handleChange}
                            />
                            <TextField
                                id="password"
                                label="Password"
                                type="password"
                                required
                                fullWidth
                            />
                            <Button variant="contained" type="submit">
                                Login
                            </Button>
                        </form>
                    </CardActions>
                    <CardContent>
                        <Typography variant="caption" color="initial">
                            If you need help logging in{' '}
                            <NavLink to="/login/help">Click Here</NavLink>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Login;
