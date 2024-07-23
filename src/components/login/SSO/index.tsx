import { Stack, Box, Button, TextField, Typography } from '@mui/material';
import { supabaseClient } from 'context/Supabase';
import React, { useCallback, useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import AlertBox from 'components/shared/AlertBox';
import { isEmpty } from 'lodash';
import { useSnackbar, VariantType } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import useRedirectPath from '../useRedirectPath';
import { DefaultLoginProps } from '../types';

interface FormDataInputs {
    domain: string;
}

const SSOForm = ({ grantToken }: DefaultLoginProps) => {
    const redirectPath = useRedirectPath(grantToken);

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const intl = useIntl();

    const [showErrors, setShowErrors] = useState(false);
    const [loading, setLoading] = useState(false);

    const [submitError, setSubmitError] = useState<AuthError | null>(null);

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

    const onSubmit = useCallback((formData: FormDataInputs) => {
        return supabaseClient.auth.signInWithSSO({
            domain: formData.domain,
        });
    }, []);

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

            const { error } = await onSubmit(formData);

            if (error) {
                setSubmitError(error);
                setLoading(false);
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
                        <Typography>{submitError.message}</Typography>
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
