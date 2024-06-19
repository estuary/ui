import { Button, Stack } from '@mui/material';
import MagicLinkInputs from 'components/login/MagicLinkInputs';
import { supabaseClient } from 'context/Supabase';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useLoginRedirectPath from 'hooks/searchParams/useLoginRedirectPath';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getLoginSettings } from 'utils/env-utils';

interface Props {
    grantToken?: string;
    hideCodeInput?: boolean;
}

// TODO (routes) This is hardcoded because unauthenticated routes is not yet invoked
//   need to move the routes to a single location. Also... just need to make the route
//   settings in all JSON probably.
const redirectToBase = `${window.location.origin}/auth`;

const loginSettings = getLoginSettings();

const MagicLink = ({ grantToken, hideCodeInput }: Props) => {
    const [showTokenValidation, setShowTokenValidation] = useState(false);

    const redirectTo = useLoginRedirectPath(redirectToBase);

    const redirectPath = useMemo(
        () =>
            grantToken
                ? `${redirectTo}?${GlobalSearchParams.GRANT_TOKEN}=${grantToken}`
                : redirectTo,
        [grantToken, redirectTo]
    );

    const magicLinkSubmit = useCallback(
        (formData: { email: string; token?: string }) => {
            if (!formData.token) {
                return supabaseClient.auth.signInWithOtp({
                    email: formData.email,
                    options: {
                        emailRedirectTo: redirectPath,
                        shouldCreateUser: loginSettings.enableEmailRegister,
                    },
                });
            }

            return supabaseClient.auth.verifyOtp({
                email: formData.email,
                token: formData.token,
                type: 'magiclink',
                options: {
                    redirectTo: redirectPath,
                },
            });
        },
        [redirectPath]
    );

    return (
        <Stack direction="column" spacing={1}>
            <MagicLinkInputs
                onSubmit={magicLinkSubmit}
                showToken={showTokenValidation}
            />

            {hideCodeInput ? null : (
                <Button
                    variant="text"
                    onClick={() => setShowTokenValidation(!showTokenValidation)}
                    sx={{
                        alignSelf: 'center',
                        width: 'auto',
                    }}
                >
                    <FormattedMessage
                        id={
                            showTokenValidation
                                ? 'login.magicLink.requestOTP'
                                : 'login.magicLink.verifyOTP'
                        }
                    />
                </Button>
            )}
        </Stack>
    );
};

export default MagicLink;
