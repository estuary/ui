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
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    let navigate = useNavigate();
    let location = useLocation() as any;
    let auth = useAuth();

    let from = location.state?.from?.pathname || '/';

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let formData = new FormData(event.currentTarget);
        let username = formData.get('username') as string;

        auth.signin(username, () => {
            // Send them back to the page they tried to visit when they were
            // redirected to the login page. Use { replace: true } so we don't create
            // another entry in the history stack for the login page.  This means that
            // when they get to the protected page and click the back button, they
            // won't end up back on the login page, which is also really nice for the
            // user experience.
            const navigateTo = from === '/' ? '/dashboard' : from;
            navigate(navigateTo, { replace: true });
        });
    }

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
            <Topbar
                title="Estuary Global Actions"
                isLoggedIn={false}
                isNavigationOpen={false}
                onNavigationToggle={() => {}}
            />
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
                        You can type anything you want - this isn't a real login
                        form.
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center' }}>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                id="userName"
                                label="User Name"
                                fullWidth
                            />
                            <TextField
                                id="password"
                                label="Password"
                                fullWidth
                                type="password"
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
