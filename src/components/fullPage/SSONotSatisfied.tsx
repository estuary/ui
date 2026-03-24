import { useState } from 'react';

import { Stack, Typography } from '@mui/material';

import SafeLoadingButton from '../SafeLoadingButton';
import { useIntl } from 'react-intl';
import { Navigate, useSearchParams } from 'react-router-dom';

import FullPageWrapper from 'src/app/FullPageWrapper';
import { unauthenticatedRoutes } from 'src/app/routes';
import { redirectToBase } from 'src/components/login/useRedirectPath';
import { supabaseClient } from 'src/context/GlobalProviders';
import { logRocketConsole } from 'src/services/shared';

// Note: this component intentionally does not handle grant tokens (invite links).
// Invite redemption is handled by the GQL mutation which independently checks SSO
// status — if the user isn't SSO-authenticated the mutation rejects and directs
// them to the normal SSO login page, where the grant token is preserved in the URL.

export function FullPageSSONotSatisfied() {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get('domain');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!domain) {
        return <Navigate to={unauthenticatedRoutes.login.path} replace />;
    }

    const handleSSOLogin = async () => {
        setLoading(true);
        setError(null);

        const { data, error: ssoError } =
            await supabaseClient.auth.signInWithSSO({
                domain,
                options: {
                    redirectTo: redirectToBase,
                },
            });

        if (ssoError) {
            logRocketConsole('Auth:SSONotSatisfied redirect failed', ssoError);
            setError(ssoError.message);
            setLoading(false);
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
        }
    };

    return (
        <FullPageWrapper error={error}>
            <Stack
                spacing={3}
                alignItems="center"
                sx={{ textAlign: 'center', minWidth: 400, p: 4 }}
            >
                <Typography variant="h5">
                    {intl.formatMessage({
                        id: 'login.sso.required.title',
                    })}
                </Typography>

                <Typography>
                    {intl.formatMessage({
                        id: 'login.sso.required.message',
                    })}
                </Typography>

                <SafeLoadingButton
                    variant="contained"
                    onClick={handleSSOLogin}
                    loading={loading}
                >
                    {intl.formatMessage({
                        id: 'login.sso.required.cta',
                    })}
                </SafeLoadingButton>
            </Stack>
        </FullPageWrapper>
    );
}
