import type { ControlProps, RankedTester } from '@jsonforms/core';

import { useCallback, useEffect, useMemo } from 'react';

import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';

import { rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { startCase } from 'lodash';
import GoogleButton from 'react-google-button';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';

import FullPageSpinner from 'src/components/fullPage/Spinner';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { optionExists } from 'src/forms/overrides/testers/testers';
import { INJECTED_VALUES, NO_PROVIDER } from 'src/forms/renderers/OAuth/shared';
import { useAllRequiredPropCheck } from 'src/forms/renderers/OAuth/useAllRequiredPropCheck';
import { useOauthHandler } from 'src/forms/renderers/OAuth/useOauthHandler';
import {
    getDiscriminator,
    getDiscriminatorDefaultValue,
} from 'src/forms/shared';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useEndpointConfigStore_setCustomErrors } from 'src/stores/EndpointConfig/hooks';
import { generateCustomError } from 'src/stores/extensions/CustomErrors';
import { Options } from 'src/types/jsonforms';
import { hasLength } from 'src/utils/misc-utils';

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
    rootSchema,
}: ControlProps) => {
    const { options } = uischema;

    const intl = useIntl();

    // Fetch what we need from stores
    const setCustomErrors = useEndpointConfigStore_setCustomErrors();

    // Used to make a better UX for users editing a config
    const isEdit = useEntityWorkflow_Editing();

    // Pull out the provider so we can render the button
    const providerVal = options ? options[Options.oauthProvider] : NO_PROVIDER;
    const provider = useMemo(() => startCase(providerVal), [providerVal]);

    // This usually means the control is nested inside a tab
    const hasOwnPathProp = hasLength(path);

    // Fetch the path we should use to fire onChange. This is kinda janky
    //      but mainly in place because of hacking around JSONForms wanting
    //      to NOT handle an object (like credentials) as a control
    const { 0: onChangePath } = useMemo<[string]>(() => {
        if (hasOwnPathProp) {
            return [path];
        } else {
            return [options?.[Options.oauthPathToFields] ?? ''];
        }
    }, [hasOwnPathProp, options, path]);

    // This is the field in an anyOf/oneOf/etc. that is used
    //      to tell which option is selected
    const discriminatorProperty = useMemo(() => {
        let schemaToCheck;

        if (hasOwnPathProp) {
            // First check the parent if we are nested
            schemaToCheck = rootSchema.properties?.[path];
        } else {
            // Now just check the schema we're in
            schemaToCheck = schema;
        }

        return getDiscriminator(schemaToCheck);
    }, [hasOwnPathProp, path, rootSchema.properties, schema]);

    const defaults = useMemo(
        () =>
            getDiscriminatorDefaultValue(
                // If Oauth is not inside oneOf (ex: slack materialization)
                //      We get the schema is for the ENTIRE config. So we need to
                //      fetch just the credential config otherwise we'll end up nesting
                schema.properties?.[onChangePath]?.properties ??
                    // If Oauth is inside oneOf (ex: google sheets capture)
                    //      We get just the schema for the credentials object so JsonForms
                    //      has already handled the "nesting" for us
                    schema.properties,
                discriminatorProperty
            ),
        [discriminatorProperty, onChangePath, schema.properties]
    );

    // Reset the configuration either to injected values or
    //  to special default values that we can check for
    const setConfigToDefault = useCallback(() => {
        logRocketEvent(CustomEvents.OAUTH_DEFAULTING, {
            discriminatorProperty,
            discriminatorExists: Boolean(defaults[discriminatorProperty]),
        });
        logRocketConsole(`${CustomEvents.OAUTH_DEFAULTING}:defaults`, defaults);

        handleChange(onChangePath, {
            ...defaults,
            ...INJECTED_VALUES,
        });
    }, [defaults, discriminatorProperty, handleChange, onChangePath]);

    const { hasAllRequiredProps, showAuthenticated } = useAllRequiredPropCheck(
        data,
        options,
        onChangePath,
        discriminatorProperty
    );

    const successHandler = useCallback(
        (tokenResponse: any) => {
            // Order matters here
            //  0. Start with the defaults to try to make sure the discriminator is there
            //  1. Get the data we have so far
            //  2. Merge in the injected values as those MUST match what the server is expecting
            //  3. Add in the response from the server for the access token
            const updatedCredentials = {
                ...defaults,
                ...(!hasOwnPathProp ? data?.[onChangePath] : data),
                ...INJECTED_VALUES,
                ...tokenResponse.data,
            };

            logRocketEvent(CustomEvents.OAUTH_SUCCESS_HANDLER, {
                discriminatorProperty,
                discriminatorExists: Boolean(
                    updatedCredentials[discriminatorProperty]
                ),
            });
            handleChange(onChangePath, updatedCredentials);
        },
        [
            data,
            defaults,
            discriminatorProperty,
            handleChange,
            hasOwnPathProp,
            onChangePath,
        ]
    );

    // OAuth Stuff
    const { errorMessage, openPopUp, loading } = useOauthHandler(
        provider,
        successHandler
    );

    // When loading we need to handle Create and Edit differently
    // For create we want to set defaults so the discriminator and injected values are set
    //      This allows for the best UX when displaying errors. Otherwise we get a bunch of
    //      ajv errors about the schema not matching.
    useMount(() => {
        if (!isEdit) {
            setConfigToDefault();
        }
    });

    // Need to manually set an error to prevent submitting the form
    useEffect(() => {
        const customErrors = [];

        // Used to set an error for the OAuth Renderer
        if (!hasAllRequiredProps) {
            customErrors.push(
                generateCustomError(
                    path,
                    intl.formatMessage({
                        id: 'oauth.error.credentialsMissing',
                    })
                )
            );
        }

        setCustomErrors(customErrors);

        return () => {
            // Make sure we clean up the custom errors if we leave this component
            setCustomErrors([]);
        };
    }, [hasAllRequiredProps, intl, path, setCustomErrors]);

    return (
        <Box
            sx={{
                mt: 2,
            }}
        >
            {loading ? <FullPageSpinner delay={0} /> : null}

            <Stack direction="column" spacing={2}>
                <Typography>
                    <FormattedMessage
                        id="oauth.instructions"
                        values={{ provider }}
                    />
                </Typography>

                {isEdit ? (
                    <Alert
                        severity="info"
                        sx={{
                            maxWidth: '50%',
                        }}
                    >
                        <FormattedMessage id="oauth.edit.message" />
                    </Alert>
                ) : null}

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

                    {showAuthenticated ? (
                        <Chip
                            disabled={!enabled || loading}
                            label={intl.formatMessage({
                                id: 'oauth.authenticated',
                            })}
                            color="success"
                            onDelete={setConfigToDefault}
                        />
                    ) : (
                        <Chip
                            label={intl.formatMessage({
                                id: 'oauth.unauthenticated',
                            })}
                            color="warning"
                        />
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

export const OAuthType = withJsonFormsControlProps(OAuthproviderRenderer);
