import {
    Button,
    Card,
    CardActions,
    CardContent,
    Checkbox,
    FormControl,
    FormControlLabel,
    Grid,
    Link,
    TextField,
    Typography,
} from '@mui/material';
import Topbar from 'components/header/Topbar';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface RegistrationRequest {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    useCase: string;
    acknowledgedDocuments: boolean;
}

interface Errors {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    company: boolean;
    useCase: boolean;
    acknowledgedDocuments: boolean;
}

const Registration = () => {
    const intl = useIntl();

    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [company, setCompany] = useState<string>('');
    const [useCase, setUseCase] = useState<string>('');
    const [acknowledgedDocuments, setAcknowledgedDocuments] =
        useState<boolean>(false);

    const [errors, setErrors] = useState<Errors>({
        firstName: false,
        lastName: false,
        email: false,
        company: false,
        useCase: false,
        acknowledgedDocuments: false,
    });

    const handlers = {
        updateFirstName: (event: React.ChangeEvent<HTMLInputElement>) => {
            setFirstName(event.target.value);
        },
        updateLastName: (event: React.ChangeEvent<HTMLInputElement>) => {
            setLastName(event.target.value);
        },
        updateEmail: (event: React.ChangeEvent<HTMLInputElement>) => {
            setEmail(event.target.value);
        },
        updateCompany: (event: React.ChangeEvent<HTMLInputElement>) => {
            setCompany(event.target.value);
        },
        updateUseCase: (event: React.ChangeEvent<HTMLInputElement>) => {
            setUseCase(event.target.value);
        },
        updateDocumentAcknowledgement: (
            event: React.SyntheticEvent,
            checked: boolean
        ) => {
            setAcknowledgedDocuments(checked);
        },
        validateFirstName: () => {
            setErrors({ ...errors, firstName: !firstName });
        },
        validateLastName: () => {
            setErrors({ ...errors, lastName: !lastName });
        },
        validateEmail: () => {
            setErrors({ ...errors, email: !email });
        },
        validateCompany: () => {
            setErrors({ ...errors, company: !company });
        },
        validateUseCase: () => {
            setErrors({ ...errors, useCase: !useCase });
        },
        validateDocumentAcknowledgement: () => {
            setErrors({
                ...errors,
                acknowledgedDocuments: !acknowledgedDocuments,
            });
        },
        signUp: () => {
            setErrors({
                firstName: !firstName,
                lastName: !lastName,
                email: !email,
                company: !company,
                useCase: !useCase,
                acknowledgedDocuments: !acknowledgedDocuments,
            });
        },
        submit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const registrationRequest: RegistrationRequest = {
                firstName,
                lastName,
                email,
                company,
                useCase,
                acknowledgedDocuments,
            };

            console.log(registrationRequest);
        },
    };

    return (
        <Grid
            container
            sx={{
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Grid item>
                <Topbar isNavigationOpen={false} />
            </Grid>

            <Grid item xs={8}>
                <Card sx={{ minHeight: 350, p: 2 }}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            align="center"
                            sx={{ mb: 1.5 }}
                        >
                            <FormattedMessage id="register.heading" />
                        </Typography>

                        <Typography sx={{ mb: 1 }}>
                            <FormattedMessage id="register.main.message" />
                        </Typography>
                    </CardContent>

                    <CardActions disableSpacing>
                        <form
                            onSubmit={handlers.submit}
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <TextField
                                id="first-name"
                                label={intl.formatMessage({
                                    id: 'data.firstName',
                                })}
                                value={firstName}
                                error={errors.firstName}
                                required
                                onChange={handlers.updateFirstName}
                                onBlur={handlers.validateFirstName}
                                sx={{ width: 250, mb: 3 }}
                            />

                            <TextField
                                id="last-name"
                                label={intl.formatMessage({
                                    id: 'data.lastName',
                                })}
                                value={lastName}
                                error={errors.lastName}
                                required
                                onChange={handlers.updateLastName}
                                onBlur={handlers.validateLastName}
                                sx={{ width: 250, mb: 3 }}
                            />

                            <TextField
                                id="email"
                                label={intl.formatMessage({
                                    id: 'data.email',
                                })}
                                value={email}
                                error={errors.email}
                                required
                                onChange={handlers.updateEmail}
                                onBlur={handlers.validateEmail}
                                sx={{ width: 250, mb: 3 }}
                            />

                            <TextField
                                id="company"
                                label={intl.formatMessage({
                                    id: 'data.company',
                                })}
                                value={company}
                                error={errors.company}
                                required
                                onChange={handlers.updateCompany}
                                onBlur={handlers.validateCompany}
                                sx={{ width: 250, mb: 3 }}
                            />

                            <TextField
                                id="describe-intended-use"
                                label={intl.formatMessage({
                                    id: 'data.register.intendedUse',
                                })}
                                value={useCase}
                                error={errors.useCase}
                                required
                                multiline
                                onChange={handlers.updateUseCase}
                                onBlur={handlers.validateUseCase}
                                sx={{ width: 250, mb: 3 }}
                            />

                            <FormControl
                                error={errors.acknowledgedDocuments}
                                sx={{ mb: 4, mx: 0 }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value={acknowledgedDocuments}
                                            required
                                        />
                                    }
                                    label={intl.formatMessage({
                                        id: 'register.documentAcknowledgement',
                                    })}
                                    onChange={
                                        handlers.updateDocumentAcknowledgement
                                    }
                                    onBlur={
                                        handlers.validateDocumentAcknowledgement
                                    }
                                />
                            </FormControl>

                            <Typography sx={{ mb: 2 }}>
                                <FormattedMessage id="register.existingAccount" />
                                <Link href="/" underline="hover">
                                    Sign In
                                </Link>
                            </Typography>

                            <Button
                                variant="contained"
                                type="submit"
                                disableElevation
                                onClick={handlers.signUp}
                            >
                                <FormattedMessage id="cta.register" />
                            </Button>
                        </form>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Registration;
