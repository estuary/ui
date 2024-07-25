import { Stack, Box, Button, TextField, Typography } from '@mui/material';
import { supabaseClient } from 'context/Supabase';
import React, { useState } from 'react';
import AlertBox from 'components/shared/AlertBox';
import { isEmpty } from 'lodash';
import { useSnackbar, VariantType } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import useRedirectPath from '../useRedirectPath';
import { DefaultLoginProps } from '../types';

const SSOForm = ({ grantToken }: DefaultLoginProps) => {
    const redirectPath = useRedirectPath(grantToken);

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const intl = useIntl();

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

            if (isEmpty(formData.domain)) {
                setShowErrors(true);
                return;
            }

            setShowErrors(false);
            setSubmitError(null);
            setLoading(true);

            const { data, error } = await supabaseClient.auth.signInWithSSO({
                domain: formData.domain,
                options: {
                    redirectTo: redirectPath,
                },
            });

            if (error) {
                // Saw these messages but no clue how to handle them right now
                // sso_provider_not_found

                // The errors returned by this call are kind of weird so overriding
                //  and setting a common message.
                setSubmitError('login.signinFailed.message.default');
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
            navigate(redirectPath);
        },
    };

    return (
        <Stack direction="column" spacing={1}>
            {submitError ? (
                <Box
                    sx={{
                        mb: 5,
                    }}
                >
                    <AlertBox severity="error" short>
                        <Typography>
                            <FormattedMessage id={submitError} />
                        </Typography>
                    </AlertBox>
                </Box>
            ) : null}

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
                    autoComplete="url"
                    color={showErrors ? 'error' : undefined}
                    disabled={loading}
                    error={showErrors}
                    fullWidth
                    helperText={intl.formatMessage({
                        id: 'login.domain.description',
                    })}
                    label={intl.formatMessage({ id: 'login.domain.label' })}
                    name="domain"
                    required
                />

                <Button
                    disabled={loading}
                    name="SSO Sign In"
                    type="submit"
                    sx={{ mt: 3 }}
                >
                    <FormattedMessage id="cta.sso" />
                </Button>
            </form>
        </Stack>
    );
};

export default SSOForm;
