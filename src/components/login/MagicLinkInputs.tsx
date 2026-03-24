import type { AuthApiError } from '@supabase/supabase-js';
import type { VariantType } from 'notistack';

import React, { useState } from 'react';

import { Box, Button, TextField, Typography } from '@mui/material';

import { isEmpty } from 'lodash';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import AlertBox from 'src/components/shared/AlertBox';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { logRocketConsole } from 'src/services/shared';

interface Props {
    onSubmit: Function;
    showToken?: boolean;
}

const SSO_REQUIRED_PREFIX = 'sso_required:';

const MagicLinkInputs = ({ onSubmit, showToken }: Props) => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const intl = useIntl();
    const setSsoNotSatisfied = useUserStore(
        (state) => state.setSsoNotSatisfied
    );

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
                if (error.message.startsWith(SSO_REQUIRED_PREFIX)) {
                    const domain = error.message.slice(
                        SSO_REQUIRED_PREFIX.length
                    );
                    logRocketConsole(
                        'Auth:SSORequired - redirecting to SSO',
                        domain
                    );
                    setSsoNotSatisfied(domain);
                    return;
                }

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
