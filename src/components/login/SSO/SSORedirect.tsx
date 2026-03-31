import { useEffect } from 'react';

import { CircularProgress, Stack } from '@mui/material';

import { useSSOSignIn } from 'src/components/login/SSO/useSSOSignIn';

interface SSORedirectProps {
    grantToken?: string;
    ssoProviderId: string;
}

export const SSORedirect = ({
    grantToken,
    ssoProviderId,
}: SSORedirectProps) => {
    const { signInSSO } = useSSOSignIn(grantToken);

    useEffect(() => {
        void signInSSO({ providerId: ssoProviderId });
    }, [ssoProviderId]); // eslint-disable-line react-hooks/exhaustive-deps

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
};
