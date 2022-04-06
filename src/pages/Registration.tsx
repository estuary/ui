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

    const numericAndSpecialRegExp: RegExp = /[0-9&^*|":<>{}`();@$#%+=?/[\]\\]/;

    // TODO: Consolidate update and validate form control function handlers.
    const handlers = {
        updateFirstName: (event: React.ChangeEvent<HTMLInputElement>) => {
            event.target.value = event.target.value.trimStart();

            event.target.value = event.target.value.replace(
                numericAndSpecialRegExp,
                ''
            );

            setFirstName(event.target.value);
        },
        updateLastName: (event: React.ChangeEvent<HTMLInputElement>) => {
            event.target.value = event.target.value.trimStart();

            event.target.value = event.target.value.replace(
                numericAndSpecialRegExp,
                ''
            );

            setLastName(event.target.value);
        },
        updateEmail: (event: React.ChangeEvent<HTMLInputElement>) => {
            event.target.value = event.target.value.trimStart();

            setEmail(event.target.value);
        },
        updateCompany: (event: React.ChangeEvent<HTMLInputElement>) => {
            event.target.value = event.target.value.trimStart();

            setCompany(event.target.value);
        },
        updateUseCase: (event: React.ChangeEvent<HTMLInputElement>) => {
            event.target.value = event.target.value.trimStart();

            setUseCase(event.target.value);
        },
        updateDocumentAcknowledgement: (
            event: React.SyntheticEvent,
            checked: boolean
        ) => {
            setAcknowledgedDocuments(checked);
        },
        validateFirstName: (
            event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (event?.target.value) {
                setFirstName(event.target.value.trimEnd());
            }

            setErrors({ ...errors, firstName: !firstName });
        },
        validateLastName: (
            event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (event?.target.value) {
                setLastName(event.target.value.trimEnd());
            }

            setErrors({ ...errors, lastName: !lastName });
        },
        validateEmail: (
            event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (event?.target.value) {
                setEmail(event.target.value.trimEnd());
            }

            setErrors({ ...errors, email: !email });
        },
        validateCompany: (
            event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (event?.target.value) {
                setCompany(event.target.value.trimEnd());
            }

            setErrors({ ...errors, company: !company });
        },
        validateUseCase: (
            event?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            if (event?.target.value) {
                setUseCase(event.target.value.trimEnd());
            }

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
