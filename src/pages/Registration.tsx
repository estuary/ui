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
import React, { useState } from 'react';
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
        updateTextInput:
            (
                controlName: keyof RegistrationRequest,
                setControl: (value: React.SetStateAction<string>) => void
            ) =>
            (
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
                event.target.value = event.target.value.trimStart();

                if (controlName === 'firstName' || controlName === 'lastName') {
                    event.target.value = event.target.value.replace(
                        /[0-9&^*|":<>{}`();@$#%+=?/[\]\\]/,
                        ''
                    );
                }

                setControl(event.target.value);
            },
        updateDocumentAcknowledgement: (
            event: React.SyntheticEvent,
            checked: boolean
        ) => {
            setAcknowledgedDocuments(checked);
        },
        validateTextInput:
            (
                controlName: keyof Errors,
                controlValue: string,
                setControl: (value: React.SetStateAction<string>) => void
            ) =>
            (
                event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
                if (event?.target.value) {
                    setControl(event.target.value.trimEnd());
                }

                setErrors({ ...errors, [`${controlName}`]: !controlValue });
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
            direction="column"
            sx={{
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Grid item>
                <Topbar isNavigationOpen={false} />
            </Grid>

            <Grid item xs={5}>
                <Card sx={{ minWidth: 400, minHeight: 300, p: 2 }}>
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
                                onChange={handlers.updateTextInput(
                                    'firstName',
                                    setFirstName
                                )}
                                onBlur={handlers.validateTextInput(
                                    'firstName',
                                    firstName,
                                    setFirstName
                                )}
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
                                onChange={handlers.updateTextInput(
                                    'lastName',
                                    setLastName
                                )}
                                onBlur={handlers.validateTextInput(
                                    'lastName',
                                    lastName,
                                    setLastName
                                )}
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
                                onChange={handlers.updateTextInput(
                                    'email',
                                    setEmail
                                )}
                                onBlur={handlers.validateTextInput(
                                    'email',
                                    email,
                                    setEmail
                                )}
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
                                onChange={handlers.updateTextInput(
                                    'company',
                                    setCompany
                                )}
                                onBlur={handlers.validateTextInput(
                                    'company',
                                    company,
                                    setCompany
                                )}
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
                                onChange={handlers.updateTextInput(
                                    'useCase',
                                    setUseCase
                                )}
                                onBlur={handlers.validateTextInput(
                                    'useCase',
                                    useCase,
                                    setUseCase
                                )}
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
