import {
    Button,
    Card,
    CardActions,
    CardContent,
    Checkbox,
    FormControl,
    FormControlLabel,
    Link,
    SxProps,
    TextField,
    Theme,
    Typography,
} from '@mui/material';
import { Auth } from '@supabase/ui';
import FullPageDialog from 'components/fullPage/Dialog';
import ExternalLink from 'components/shared/ExternalLink';
import { slate } from 'context/Theme';
import useBrowserTitle from 'hooks/useBrowserTitle';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getUserDetails } from 'services/supabase';
import { getUrls } from 'utils/env-utils';

interface RegistrationRequest {
    fullName: string;
    email: string;
    company: string;
    useCase: string;
    acknowledgedDocuments: boolean;
}

interface Errors {
    fullName: boolean;
    email: boolean;
    company: boolean;
    acknowledgedDocuments: boolean;
}

const urls = getUrls();

const Registration = () => {
    useBrowserTitle('browserTitle.registration');

    const intl = useIntl();
    const { user } = Auth.useUser();

    const { email: authEmail, userName: authUserName } = getUserDetails(user);

    const [fullName, setFullName] = useState<string>(authUserName);
    const [email, setEmail] = useState<string>(authEmail);
    const [company, setCompany] = useState<string>('');
    const [useCase, setUseCase] = useState<string>('');
    const [acknowledgedDocuments, setAcknowledgedDocuments] =
        useState<boolean>(false);

    const [errors, setErrors] = useState<Errors>({
        fullName: false,
        email: false,
        company: false,
        acknowledgedDocuments: false,
    });

    const textFieldSx: SxProps<Theme> = {
        width: 250,
        mb: 3,
        backgroundColor: slate[800],
        label: { color: slate[50] },
    };

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

                if (controlName === 'fullName') {
                    const numericAndSpecialRegExp: RegExp =
                        /[0-9&^*|":<>{}`();@$#%+=?/[\]\\]/;

                    event.target.value = event.target.value.replace(
                        numericAndSpecialRegExp,
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
                fullName: !fullName,
                email: !email,
                company: !company,
                acknowledgedDocuments: !acknowledgedDocuments,
            });
        },
        submit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const registrationRequest: RegistrationRequest = {
                fullName,
                email,
                company,
                useCase,
                acknowledgedDocuments,
            };

            console.log(registrationRequest);
        },
    };

    return (
        <FullPageDialog>
            <Card
                raised={false}
                sx={{
                    background: 'transparent',
                }}
            >
                <CardContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="h6" align="center" sx={{ mb: 1.5 }}>
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
                            id="full-name"
                            label={intl.formatMessage({
                                id: 'register.label.fullName',
                            })}
                            value={fullName}
                            error={errors.fullName}
                            required
                            onChange={handlers.updateTextInput(
                                'fullName',
                                setFullName
                            )}
                            onBlur={handlers.validateTextInput(
                                'fullName',
                                fullName,
                                setFullName
                            )}
                            sx={textFieldSx}
                        />

                        <TextField
                            id="email"
                            label={intl.formatMessage({
                                id: 'register.label.email',
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
                            sx={textFieldSx}
                        />

                        <TextField
                            id="company"
                            label={intl.formatMessage({
                                id: 'register.label.company',
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
                            sx={textFieldSx}
                        />

                        <TextField
                            id="describe-intended-use"
                            label={intl.formatMessage({
                                id: 'register.label.intendedUse',
                            })}
                            value={useCase}
                            multiline
                            minRows={3}
                            onChange={handlers.updateTextInput(
                                'useCase',
                                setUseCase
                            )}
                            sx={textFieldSx}
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
                                onChange={
                                    handlers.updateDocumentAcknowledgement
                                }
                                onBlur={
                                    handlers.validateDocumentAcknowledgement
                                }
                                label={
                                    <FormattedMessage
                                        id="register.label.documentAcknowledgement"
                                        values={{
                                            privacy: (
                                                <ExternalLink
                                                    hideIcon
                                                    link={urls.privacyPolicy}
                                                >
                                                    <FormattedMessage id="register.label.documentAcknowledgement.privacy" />
                                                </ExternalLink>
                                            ),
                                            terms: (
                                                <ExternalLink
                                                    hideIcon
                                                    link={urls.termsOfService}
                                                >
                                                    <FormattedMessage id="register.label.documentAcknowledgement.terms" />
                                                </ExternalLink>
                                            ),
                                        }}
                                    />
                                }
                            />
                        </FormControl>

                        <Typography sx={{ mb: 2 }}>
                            <FormattedMessage id="register.existingAccount" />{' '}
                            <Link href="/" underline="hover">
                                <FormattedMessage id="cta.login" />
                            </Link>
                        </Typography>

                        <Button type="submit" onClick={handlers.signUp}>
                            <FormattedMessage id="cta.register" />
                        </Button>
                    </form>
                </CardActions>
            </Card>
        </FullPageDialog>
    );
};

export default Registration;
