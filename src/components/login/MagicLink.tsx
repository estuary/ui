import { Button, Stack } from '@mui/material';
import MagicLinkInputs from 'components/login/MagicLinkInputs';
import { supabaseClient } from 'context/GlobalProviders';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getLoginSettings } from 'utils/env-utils';
import { MagicLinkProps } from './types';
import useRedirectPath from './useRedirectPath';

const loginSettings = getLoginSettings();

const MagicLink = ({ grantToken, hideCodeInput }: MagicLinkProps) => {
    const [showTokenValidation, setShowTokenValidation] = useState(false);

    const redirectPath = useRedirectPath(grantToken);

    const onSubmit = useCallback(
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
                onSubmit={onSubmit}
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
