import { Box, Button, TextField, Typography } from '@mui/material';
import type { AuthApiError } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/routes';
import AlertBox from 'components/shared/AlertBox';
import { isEmpty } from 'lodash';
import type { VariantType } from 'notistack';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

interface Props {
    onSubmit: Function;
    showToken?: boolean;
}

const MagicLinkInputs = ({ onSubmit, showToken }: Props) => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const intl = useIntl();

    const [showErrors, setShowErrors] = useState(false);
    const [loading, setLoading] = useState(false);

    const [submitError, setSubmitError] = useState<AuthApiError | null>(null);

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

            const formData = Object.fromEntries(
                new FormData(event.currentTarget)
            );

            if (
                isEmpty(formData.email) ||
                (showToken && isEmpty(formData.token))
            ) {
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

            if (showToken) {
                navigate(authenticatedRoutes.home.path, { replace: true });
            } else {
                displayNotification('login.magicLink', 'success');
                setLoading(false);
            }
        },
    };

    return (
        <>
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
                    required
                    fullWidth
                    autoComplete="email"
                    disabled={loading}
                    helperText={intl.formatMessage({
                        id: 'login.email.description',
                    })}
                    label={intl.formatMessage({
                        id: 'login.email.label',
                    })}
                    name="email"
                    error={showErrors}
                    color={showErrors ? 'error' : undefined}
                />

                {showToken ? (
                    <TextField
                        required
                        fullWidth
                        disabled={loading}
                        helperText={intl.formatMessage({
                            id: 'login.token.description',
                        })}
                        label={intl.formatMessage({
                            id: 'login.token.label',
                        })}
                        name="token"
                        error={showErrors}
                        color={showErrors ? 'error' : undefined}
                        inputProps={{
                            minLength: 5,
                        }}
                    />
                ) : null}

                <Button
                    name="Sign In"
                    type="submit"
                    sx={{ mt: 3 }}
                    disabled={loading}
                >
                    <FormattedMessage
                        id={showToken ? 'cta.verifyOTP' : 'cta.magicLink'}
                    />
                </Button>
            </form>
        </>
    );
};

export default MagicLinkInputs;
