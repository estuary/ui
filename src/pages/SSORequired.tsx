import type { ErrorDetails } from 'src/components/shared/Error/types';

import { useEffect, useState } from 'react';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';
import { Navigate, useSearchParams } from 'react-router-dom';

import { unauthenticatedRoutes } from 'src/app/routes';
import FullPageDialog from 'src/components/fullPage/Dialog';
import { redirectToBase } from 'src/components/login/useRedirectPath';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import Error from 'src/components/shared/Error';
import { supabaseClient } from 'src/context/GlobalProviders';
import HeaderMessage from 'src/pages/login/HeaderMessage';
import { logRocketEvent } from 'src/services/shared';

// Note: this component intentionally does not handle grant tokens (invite links).
// Invite redemption is handled by the GQL mutation which independently checks SSO
// status — if the user isn't SSO-authenticated the mutation rejects and directs
// them to the normal SSO login page, where the grant token is preserved in the URL.

export function SSORequired() {
    const intl = useIntl();
    const [searchParams] = useSearchParams();
    const domain = searchParams.get('domain');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ErrorDetails>(null);

    useEffect(() => {
        void supabaseClient.auth.signOut();
    }, []);

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
            logRocketEvent('Auth:SSORedirectFailed', { ssoError });
            setError(ssoError);
            setLoading(false);
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
        } else {
            // Fallback if no redirect URL was returned — don't leave the button stuck
            window.location.href = '/';
        }
    };

    return (
        <FullPageDialog>
            <Error error={error} condensed={true} hideTitle={true} />
            <Stack
                spacing={3}
                alignItems="center"
                sx={{ textAlign: 'center', minWidth: 400, p: 4 }}
            >
                <HeaderMessage
                    headerMessageId="login.sso.required.title"
                    isRegister={false}
                />

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
        </FullPageDialog>
    );
}
