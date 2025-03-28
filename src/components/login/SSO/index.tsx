import React, { useState } from 'react';

import {
    Box,
    Button,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { DefaultLoginProps } from '../types';
import useRedirectPath from '../useRedirectPath';
import { useSnackbar, VariantType } from 'notistack';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';
import { supabaseClient } from 'src/context/GlobalProviders';
import { hasLength } from 'src/utils/misc-utils';

const SSOForm = ({ grantToken }: DefaultLoginProps) => {
    const redirectPath = useRedirectPath(grantToken);

    const intl = useIntl();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [showErrors, setShowErrors] = useState(false);
    const [loading, setLoading] = useState(false);

    const [submitError, setSubmitError] = useState<string | null>(null);

    const displayNotification = (id: string, variant: VariantType) => {
        enqueueSnackbar(
            intl.formatMessage({
                id,
            }),
            {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                variant,
            }
        );
    };

    const handlers = {
        submit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            // TODO (typing)
            // forcing to any but it really is FormDataInputs
            const formData: any = Object.fromEntries(
                new FormData(event.currentTarget)
            );

            const splitEmail = formData.email.split('@');
            const submittedDomain = splitEmail[1];

            if (!hasLength(submittedDomain)) {
                setShowErrors(true);
                return;
            }

            setShowErrors(false);
            setSubmitError(null);
            setLoading(true);

            const { data, error } = await supabaseClient.auth.signInWithSSO({
                domain: submittedDomain,
                options: {
                    redirectTo: redirectPath,
                },
            });

            if (error) {
                // Saw these messages but no clue how to handle them right now
                // sso_provider_not_found

                // The errors returned by this call are kind of weird so overriding
                //  and setting a common message.
                setSubmitError(
                    intl.formatMessage(
                        { id: 'login.signinFailed.message.default' },
                        {
                            domain: submittedDomain,
                        }
                    )
                );
                setLoading(false);
                return;
            }

            if (data.url) {
                // redirect the user to the identity provider's authentication flow
                window.location.href = data.url;
                return;
            }

            displayNotification('login.sso', 'success');
            setLoading(false);
            navigate(redirectPath, {
                replace: true,
            });
        },
    };

    return (
        <Stack direction="column" spacing={3} style={{ width: '100%' }}>
            <Typography>
                {intl.formatMessage({ id: 'login.sso.header' })}
            </Typography>
            {submitError ? (
                <Box>
                    <AlertBox severity="error" short>
                        <Typography>{submitError}</Typography>
                        <Typography>
                            {intl.formatMessage({ id: 'error.tryAgain' })}
                        </Typography>
                    </AlertBox>
                </Box>
            ) : null}

            <Box>
                <form
                    onSubmit={handlers.submit}
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        width: '100%',
                    }}
                >
                    <TextField
                        autoComplete="email"
                        color={showErrors ? 'error' : undefined}
                        disabled={loading}
                        error={showErrors}
                        fullWidth
                        helperText={intl.formatMessage({
                            id: 'login.companyEmail.description',
                        })}
                        inputProps={{
                            type: 'email',
                        }}
                        label={intl.formatMessage({
                            id: 'login.companyEmail.label',
                        })}
                        name="email"
                        required
                    />

                    <Button
                        disabled={loading}
                        fullWidth
                        name="SSO Sign In"
                        size="large"
                        type="submit"
                        sx={{ mt: 3 }}
                    >
                        {intl.formatMessage({ id: 'cta.login.sso' })}
                    </Button>
                </form>
            </Box>
            <Divider />
            <Box>
                <MessageWithLink messageID="login.sso.message.help" />
            </Box>
        </Stack>
    );
};

export default SSOForm;
