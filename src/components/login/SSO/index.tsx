import {
    Stack,
    Box,
    Button,
    TextField,
    Typography,
    Divider,
} from '@mui/material';
import { supabaseClient } from 'context/Supabase';
import React, { useState } from 'react';
import AlertBox from 'components/shared/AlertBox';
import { useSnackbar, VariantType } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { hasLength } from 'utils/misc-utils';
import MessageWithLink from 'components/content/MessageWithLink';
import useRedirectPath from '../useRedirectPath';
import { DefaultLoginProps } from '../types';

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
                <FormattedMessage id="login.sso.header" />
            </Typography>
            {submitError ? (
                <Box>
                    <AlertBox severity="error" short>
                        <Typography>{submitError}</Typography>
                        <Typography>
                            <FormattedMessage id="error.tryAgain" />
                        </Typography>
                    </AlertBox>
                </Box>
            ) : null}

            <Box>
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
                        name="SSO Sign In"
                        type="submit"
                        sx={{ mt: 3 }}
                    >
                        <FormattedMessage id="cta.login.sso" />
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
