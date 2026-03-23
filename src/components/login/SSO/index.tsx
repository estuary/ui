import type { VariantType } from 'notistack';
import type { DefaultLoginProps } from 'src/components/login/types';

import React, { useEffect, useState } from 'react';

import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import MessageWithLink from 'src/components/content/MessageWithLink';
import useRedirectPath from 'src/components/login/useRedirectPath';
import AlertBox from 'src/components/shared/AlertBox';
import { supabaseClient } from 'src/context/GlobalProviders';
import { hasLength } from 'src/utils/misc-utils';

interface SSOFormProps extends DefaultLoginProps {
    ssoProviderId?: string;
}

const SSOForm = ({ grantToken, ssoProviderId }: SSOFormProps) => {
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

    // When ssoProviderId is present (e.g. from an invite link), auto-trigger
    // SSO sign-in directly without requiring the user to enter their email.
    useEffect(() => {
        if (!ssoProviderId) return;

        let cancelled = false;

        const signInWithProvider = async () => {
            setLoading(true);

            const { data, error } =
                await supabaseClient.auth.signInWithSSO({
                    providerId: ssoProviderId,
                    options: {
                        redirectTo: redirectPath,
                    },
                });

            if (cancelled) return;

            if (error) {
                setSubmitError(
                    intl.formatMessage({
                        id: 'login.signinFailed.message.default',
                    })
                );
                setLoading(false);
                return;
            }

            if (data.url) {
                window.location.href = data.url;
                return;
            }

            displayNotification('login.sso', 'success');
            setLoading(false);
            navigate(redirectPath, { replace: true });
        };

        void signInWithProvider();

        return () => {
            cancelled = true;
        };
    }, [ssoProviderId]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // When auto-redirecting via ssoProviderId, show a spinner instead of the
    // email form. Fall through to the full form only if an error occurred so the
    // user can retry manually.
    if (ssoProviderId && !submitError) {
        return (
            <Stack
                direction="column"
                spacing={3}
                alignItems="center"
                style={{ width: '100%' }}
            >
                <CircularProgress />
            </Stack>
        );
    }

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
