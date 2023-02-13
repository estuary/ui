import { Button, Stack } from '@mui/material';
import { REDIRECT_TO_PARAM_NAME } from 'app/routes';
import MagicLinkInputs from 'components/login/MagicLinkInputs';
import { useClient } from 'hooks/supabase-swr';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { custom_generateDefaultUISchema } from 'services/jsonforms';
import useConstant from 'use-constant';
import { getLoginSettings } from 'utils/env-utils';

// TODO (routes) This is hardcoded because unauthenticated routes is not yet invoked
//   need to move the routes to a single location. Also... just need to make the route
//   settings in all JSON probably.
const redirectToBase = `${window.location.origin}/auth`;

const loginSettings = getLoginSettings();

const MagicLink = () => {
    const [showTokenValidation, setShowTokenValidation] = useState(false);

    const supabaseClient = useClient();
    const intl = useIntl();

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

    custom_generateDefaultUISchema;

    const location = useLocation();
    const from = location.state?.from?.pathname || '/app';

    const redirectTo = `${redirectToBase}?${REDIRECT_TO_PARAM_NAME}=${encodeURIComponent(
        from
    )}`;

    return (
        <Stack direction="column" spacing={1}>
            {showTokenValidation ? (
                <MagicLinkInputs
                    onSubmit={(formData: { email: string; token: string }) => {
                        return supabaseClient.auth.verifyOTP(
                            {
                                email: formData.email,
                                token: formData.token,
                                type: 'magiclink',
                            },
                            {
                                redirectTo,
                            }
                        );
                    }}
                    schema={verifySchema}
                    uiSchema={verifyUiSchema}
                />
            ) : (
                <MagicLinkInputs
                    onSubmit={(formData: { email: string }) => {
                        return supabaseClient.auth.signIn(
                            {
                                email: formData.email,
                            },
                            {
                                redirectTo,
                                shouldCreateUser:
                                    loginSettings.enableEmailRegister,
                            }
                        );
                    }}
                    schema={requestSchema}
                    uiSchema={requestUiSchema}
                />
            )}

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
        </Stack>
    );
};

export default MagicLink;
