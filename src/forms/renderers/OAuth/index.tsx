import { useEffect, useMemo } from 'react';

import { startCase } from 'lodash';
import GoogleButton from 'react-google-button';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';

import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';

import FullPageSpinner from 'components/fullPage/Spinner';

import { useEntityWorkflow_Editing } from 'context/Workflow';

import { optionExists } from 'forms/renderers/Overrides/testers/testers';

import { useEndpointConfigStore_setCustomErrors } from 'stores/EndpointConfig/hooks';
import { generateCustomError } from 'stores/extensions/CustomErrors';

import { Options } from 'types/jsonforms';

import { hasLength } from 'utils/misc-utils';

import {
    getDefaultValue,
    getDiscriminator,
} from '../Overrides/material/complex/MaterialOneOfRenderer_Discriminator';
import { INJECTED_VALUES, NO_PROVIDER } from './shared';
import { useAllRequiredPropCheck } from './useAllRequiredPropCheck';
import { useOauthHandler } from './useOauthHandler';

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

    // Reset the configuration either to injected values or
    //  to special default values that we can check for
    const setConfigToDefault = () => {
        const defaults = getDefaultValue(
            // If Oauth is not inside oneOf (ex: slack materialization)
            //      We get the schema is for the ENTIRE config. So we need to
            //      fetch just the credential config otherwise we'll end up nesting
            schema.properties?.[onChangePath]?.properties ??
                // If Oauth is inside oneOf (ex: google sheets capture)
                //      We get just the schema for the credentials object so JsonForms
                //      has already handled the "nesting" for us
                schema.properties,
            discriminatorProperty
        );
        handleChange(onChangePath, {
            ...defaults,
            ...INJECTED_VALUES,
        });
    };

    const { hasAllRequiredProps, showAuthenticated } = useAllRequiredPropCheck(
        data,
        options,
        onChangePath,
        discriminatorProperty
    );

    // OAuth Stuff
    const { errorMessage, openPopUp, loading } = useOauthHandler(
        provider,
        (tokenResponse) => {
            // Order matters here
            //  1. Get the data we have so far
            //  2. Merge in the injected values as those MUST match what the server is expecting
            //  3. Add in the response from the server for the access token
            const updatedCredentials = {
                ...(!hasOwnPathProp ? data?.[onChangePath] : data),
                ...INJECTED_VALUES,
                ...tokenResponse.data,
            };

            handleChange(onChangePath, updatedCredentials);
        }
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
            {loading ? <FullPageSpinner /> : null}

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
                            label={
                                <FormattedMessage id="oauth.authenticated" />
                            }
                            color="success"
                            onDelete={setConfigToDefault}
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
