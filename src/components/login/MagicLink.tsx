import { Button, Stack } from '@mui/material';
import MagicLinkInputs from 'components/login/MagicLinkInputs';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import useLoginRedirectPath from 'hooks/searchParams/useLoginRedirectPath';
import useClient from 'hooks/supabase-swr/hooks/useClient';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import useConstant from 'use-constant';
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

    const supabaseClient = useClient();
    const intl = useIntl();
    const redirectTo = useLoginRedirectPath(redirectToBase);

    const email = {
        schema: {
            description: intl.formatMessage({
                id: 'login.email.description',
            }),
            title: intl.formatMessage({
                id: 'login.email.label',
            }),
            minLength: 5,
            type: 'string',
        },
    };

    const token = {
        schema: {
            description: intl.formatMessage({
                id: 'login.token.description',
            }),
            title: intl.formatMessage({
                id: 'login.token.label',
            }),
            secret: true,
            type: 'string',
        },
    };

    const verifySchema = {
        properties: {
            email: email.schema,
            token: token.schema,
        },
        required: ['email', 'token'],
        type: 'object',
    };
    const verifyUiSchema = useConstant(() =>
        custom_generateDefaultUISchema(verifySchema)
    );

    const requestSchema = {
        properties: {
            email: email.schema,
        },
        required: ['email'],
        type: 'object',
    };
    const requestUiSchema = useConstant(() =>
        custom_generateDefaultUISchema(requestSchema)
    );

    const redirectPath = useMemo(
        () =>
            grantToken
                ? `${redirectTo}?${GlobalSearchParams.GRANT_TOKEN}=${grantToken}`
                : redirectTo,
        [grantToken, redirectTo]
    );

    const magicLinkOnSubmitWithToken = useCallback(
        (formData: { email: string; token: string }) => {
            return supabaseClient.auth.verifyOtp({
                email: formData.email,
                token: formData.token,
                type: 'magiclink',
                options: {
                    redirectTo: redirectPath,
                },
            });
        },
        [redirectPath, supabaseClient.auth]
    );

    const magicLinkOnSubmitWithoutToken = useCallback(
        (formData: { email: string }) => {
            return supabaseClient.auth.signInWithOtp({
                email: formData.email,
                options: {
                    emailRedirectTo: redirectPath,
                    shouldCreateUser: loginSettings.enableEmailRegister,
                },
            });
        },
        [redirectPath, supabaseClient.auth]
    );

    return (
        <Stack direction="column" spacing={1}>
            {showTokenValidation ? (
                <MagicLinkInputs
                    onSubmit={magicLinkOnSubmitWithToken}
                    schema={verifySchema}
                    uiSchema={verifyUiSchema}
                />
            ) : (
                <MagicLinkInputs
                    onSubmit={magicLinkOnSubmitWithoutToken}
                    schema={requestSchema}
                    uiSchema={requestUiSchema}
                />
            )}

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
