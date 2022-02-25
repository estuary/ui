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

const Login: React.FC = () => {
    const [userName, setUserName] = useState('');
    const intl = useIntl();
    const { login } = useAuth();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        login(userName);
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
                </Card>
            </Grid>
        </Grid>
    );
};

export default Login;
