import { Button, Card, CardActions, CardContent, TextField, Typography } from '@mui/material';
import { useAuth } from 'auth/Context';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    let navigate = useNavigate();
    let location = useLocation() as any;
    let auth = useAuth();

    let from = location.state?.from?.pathname || "/";

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let formData = new FormData(event.currentTarget);
        let username = formData.get("username") as string;

        auth.signin(username, () => {
            // Send them back to the page they tried to visit when they were
            // redirected to the login page. Use { replace: true } so we don't create
            // another entry in the history stack for the login page.  This means that
            // when they get to the protected page and click the back button, they
            // won't end up back on the login page, which is also really nice for the
            // user experience.
            navigate(from, { replace: true });
        });
    }


    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardContent>
                <Typography
                    gutterBottom
                    variant="h6"
                    component="h2"
                    style={{ textAlign: "center", paddingTop: "1rem" }}
                >
                    Estuary Control Plane
                </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: "center" }}>
                <form onSubmit={handleSubmit}>
                    <TextField id="userName" label="User Name" fullWidth />
                    <TextField id="password" label="Password" fullWidth type="password" />
                    <Button variant='contained'>Login</Button>
                </form>
            </CardActions>
            <CardContent>
                <Typography variant="caption" color="initial">
                    If you need help logging in <NavLink to="help">Click Here</NavLink>
                </Typography>
            </CardContent>
        </Card>
    );
};

export default Login;
