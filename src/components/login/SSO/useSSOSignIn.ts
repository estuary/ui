import { useState } from 'react';

import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import useRedirectPath from 'src/components/login/useRedirectPath';
import { supabaseClient } from 'src/context/GlobalProviders';

export function useSSOSignIn(grantToken?: string) {
    const redirectPath = useRedirectPath(grantToken);

    const intl = useIntl();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSSOResult = (
        data: { url?: string } | null,
        error: Error | null,
        errorMessageValues?: Record<string, string>
    ) => {
        if (error) {
            setSubmitError(
                intl.formatMessage(
                    { id: 'login.signinFailed.message.default' },
                    errorMessageValues
                )
            );
            setLoading(false);
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
            return;
        }

        setLoading(false);
        navigate(redirectPath, { replace: true });
    };

    const signInSSO = async (
        params: { providerId: string } | { domain: string }
    ) => {
        setSubmitError(null);
        setLoading(true);

        const { data, error } = await supabaseClient.auth.signInWithSSO({
            ...params,
            options: {
                redirectTo: redirectPath,
            },
        });

        handleSSOResult(data, error, params);
    };

    return { loading, submitError, signInSSO };
}
