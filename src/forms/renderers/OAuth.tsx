import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { accessToken, authURL } from 'api/oauth';
import FullPageSpinner from 'components/fullPage/Spinner';
import { optionExists } from 'forms/renderers/Overrides/testers/testers';
import { useOAuth2 } from 'hooks/forks/react-use-oauth2/components';
import { every, includes, isEmpty, startCase } from 'lodash';
import { useMemo, useState } from 'react';
import GoogleButton from 'react-google-button';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDetailsForm_connectorImage_connectorId } from 'stores/DetailsForm';
import { Options } from 'types/jsonforms';
import { hasLength } from 'utils/misc-utils';
import { getDiscriminator } from './Overrides/material/complex/MaterialOneOfRenderer_Discriminator';

const NO_PROVIDER = 'noProviderFound';
const CLIENT_ID = 'client_id';
const CLIENT_SECRET = 'client_secret';
const INJECTED = '_injectedDuringEncryption_'; //MUST stay in sync with animate-carnival/supabase/functions/oauth/encrypt-config.ts

export const oAuthProviderTester: RankedTester = rankWith(
    1000,
    optionExists(Options.oauthProvider)
);

const OAuthproviderRenderer = ({
    data,
    path,
    handleChange,
    uischema,
    enabled,
    schema,
}: ControlProps) => {
    const intl = useIntl();
    const { options } = uischema;
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hasOwnPathProp = hasLength(path); //this means the control is nested inside a tab

    const { 0: onChangePath } = useMemo<[string]>(() => {
        if (hasOwnPathProp) {
            return [path];
        } else {
            return [options?.[Options.oauthPathToFields] ?? ''];
        }
    }, [hasOwnPathProp, options, path]);

    const descriminatorProperty = getDiscriminator(schema);
    const requiredFields = useMemo(
        () => (options ? options[Options.oauthFields] : []),
        [options]
    );

    const hasAllRequiredProps = useMemo(() => {
        const dataKeys = Object.keys(data ?? {});
        const nestedKeys = Object.keys(data?.[onChangePath] ?? {});

        return every(requiredFields, (field: string) => {
            if (field === CLIENT_ID || field === CLIENT_SECRET) {
                return true;
            }

            if (descriminatorProperty && field === descriminatorProperty) {
                return true;
            }

            if (includes(dataKeys, field) && hasLength(data?.[field])) {
                return true;
            }

            if (
                includes(nestedKeys, field) &&
                hasLength(data?.[onChangePath]?.[field])
            ) {
                return true;
            }

            return false;
        });
    }, [data, descriminatorProperty, onChangePath, requiredFields]);

    console.log('data', data);
    console.log('hasAllRequiredProps = ', hasAllRequiredProps);

    const providerVal = options ? options[Options.oauthProvider] : NO_PROVIDER;
    const provider = useMemo(() => startCase(providerVal), [providerVal]);

    const onError = (error: any) => {
        if (error === 'access_denied') {
            setErrorMessage(
                intl.formatMessage(
                    {
                        id: 'oauth.authentication.denied',
                    },
                    { provider }
                )
            );
        } else {
            setErrorMessage(error);
        }
    };

    const onSuccess = async (payload: any) => {
        const tokenResponse = await accessToken(payload.state, payload.code);

        if (tokenResponse.error) {
            setErrorMessage(
                intl.formatMessage(
                    { id: 'oauth.accessToken.error' },
                    { provider }
                )
            );
        } else if (!isEmpty(tokenResponse.data)) {
            // These are injected by the server/encryption call so just setting
            //  some value here to pass the validation
            const fakeDefaults = {
                [CLIENT_ID]: INJECTED,
                [CLIENT_SECRET]: INJECTED,
            };
            handleChange(onChangePath, {
                ...fakeDefaults,
                ...tokenResponse.data,
            });
        }
    };

    const { loading, getAuth } = useOAuth2({
        onSuccess,
        onError,
    });

    const imageTag = useDetailsForm_connectorImage_connectorId();

    const openPopUp = async () => {
        setErrorMessage(null);

        const fetchAuthURL = await authURL(imageTag);

        if (fetchAuthURL.error) {
            setErrorMessage(
                intl.formatMessage({ id: 'oauth.fetchAuthURL.error' })
            );
        } else if (!isEmpty(fetchAuthURL.data)) {
            // This kicks off the call and the success is handled with the onSuccess/onError
            getAuth(fetchAuthURL.data.url, fetchAuthURL.data.state);
        }
    };

    const removeCofig = () => {
        handleChange(onChangePath, undefined);
    };

    return (
        <Box
            sx={{
                mt: 2,
            }}
        >
            {loading ? <FullPageSpinner /> : null}

            <Stack direction="column" spacing={2}>
                <Typography>
                    <FormattedMessage
                        id="oauth.instructions"
                        values={{ provider }}
                    />
                </Typography>

                {hasLength(errorMessage) ? (
                    <Alert
                        severity="error"
                        sx={{
                            maxWidth: '50%',
                        }}
                    >
                        {errorMessage}
                    </Alert>
                ) : null}

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        alignItems: 'center',
                    }}
                >
                    {providerVal === 'google' ? (
                        <GoogleButton
                            disabled={!enabled || loading}
                            onClick={openPopUp}
                        />
                    ) : (
                        <Button
                            disabled={!enabled || loading}
                            onClick={openPopUp}
                        >
                            <FormattedMessage
                                id="oauth.authenticate"
                                values={{ provider }}
                            />
                        </Button>
                    )}

                    {hasAllRequiredProps ? (
                        <Chip
                            disabled={!enabled || loading}
                            label={
                                <FormattedMessage id="oauth.authenticated" />
                            }
                            color="success"
                            onDelete={removeCofig}
                        />
                    ) : (
                        <Chip
                            label={
                                <FormattedMessage id="oauth.unauthenticated" />
                            }
                            color="warning"
                        />
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

export const OAuthType = withJsonFormsControlProps(OAuthproviderRenderer);
