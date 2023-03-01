import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { accessToken, authURL } from 'api/oauth';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import FullPageSpinner from 'components/fullPage/Spinner';
import { useEntityWorkflow } from 'context/Workflow';
import { optionExists } from 'forms/renderers/Overrides/testers/testers';
import { useOAuth2 } from 'hooks/forks/react-use-oauth2/components';
import { every, includes, isEmpty, startCase } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import GoogleButton from 'react-google-button';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { useDetailsForm_connectorImage_connectorId } from 'stores/DetailsForm/hooks';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_setEndpointCustomErrors,
} from 'stores/EndpointConfig/hooks';
import { Options } from 'types/jsonforms';
import { hasLength } from 'utils/misc-utils';
import {
    getDefaultValue,
    getDiscriminator,
} from './Overrides/material/complex/MaterialOneOfRenderer_Discriminator';

const NO_PROVIDER = 'noProviderFound';
const CLIENT_ID = 'client_id';
const CLIENT_SECRET = 'client_secret';
const INJECTED = '_injectedDuringEncryption_'; //MUST stay in sync with animate-carnival/supabase/functions/oauth/encrypt-config.ts

// These are injected by the server/encryption call so just setting
//      some value here to pass the validation
const fakeDefaults = {
    [CLIENT_ID]: INJECTED,
    [CLIENT_SECRET]: INJECTED,
};

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
    const intl = useIntl();
    const { options } = uischema;
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch what we need from stores
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const imageTag = useDetailsForm_connectorImage_connectorId();
    const setCustomErrors = useEndpointConfigStore_setEndpointCustomErrors();

    // Used to make a better UX for users editing a config
    const draftId = useEditorStore_id();
    const workflow = useEntityWorkflow();
    const isEdit =
        workflow === 'capture_edit' || workflow === 'materialization_edit';

    // This usually means the control is nested inside a tab
    const hasOwnPathProp = hasLength(path);

    // Fetch the patch we should use to fire onChange. This is kinda janky
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

    // Need to know the list of required fields so we can manually
    //      check them down below
    const requiredFields = useMemo(
        () => (options ? options[Options.oauthFields] : []),
        [options]
    );

    const setConfigToDefault = () => {
        const defaults = getDefaultValue(
            schema.properties,
            discriminatorProperty
        );
        handleChange(onChangePath, {
            ...defaults,
            ...fakeDefaults,
        });
    };

    const [hasAllRequiredProps, setHasAllRequiredProps] = useState(false);
    useEffect(() => {
        const dataKeys = Object.keys(data ?? {});
        const nestedKeys = Object.keys(data?.[onChangePath] ?? {});

        const response = every(requiredFields, (field: string) => {
            // We know we should always have at least these two
            if (field === CLIENT_ID || field === CLIENT_SECRET) {
                return true;
            }

            // When inside a oneOf/anOf/etc. we need to check we have the discriminator
            if (discriminatorProperty && field === discriminatorProperty) {
                return true;
            }

            // Check if the field is in the main data
            if (includes(dataKeys, field) && hasLength(data?.[field])) {
                return true;
            }

            // As a last effort check if the field is inside of nested data
            if (
                includes(nestedKeys, field) &&
                hasLength(data?.[onChangePath]?.[field])
            ) {
                return true;
            }

            // Didn't find anything - return false
            return false;
        });

        setHasAllRequiredProps(response);
    }, [data, discriminatorProperty, onChangePath, requiredFields]);

    // Pull out the provider so we can render the button
    const providerVal = options ? options[Options.oauthProvider] : NO_PROVIDER;
    const provider = useMemo(() => startCase(providerVal), [providerVal]);

    // handler for the useOauth stuff
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

    // handler for the useOauth stuff
    const onSuccess = async (payload: any) => {
        const tokenResponse = await accessToken(
            payload.state,
            payload.code,
            endpointConfigData
        );

        if (tokenResponse.error) {
            setErrorMessage(
                intl.formatMessage(
                    { id: 'oauth.accessToken.error' },
                    { provider }
                )
            );
        } else if (isEmpty(tokenResponse.data)) {
            setErrorMessage(
                intl.formatMessage(
                    { id: 'oauth.emptyData.error' },
                    { provider }
                )
            );
        } else {
            handleChange(onChangePath, {
                ...fakeDefaults,
                ...(!hasOwnPathProp ? data?.[onChangePath] : data),
                ...tokenResponse.data,
            });
        }
    };

    // This does not make the call - just wiring stuff up and getting
    //      a function/state to use
    const { loading, getAuth } = useOAuth2({
        onSuccess,
        onError,
    });

    const openPopUp = async () => {
        setErrorMessage(null);

        // Make the call to know what pop url to open
        const fetchAuthURL = await authURL(imageTag, endpointConfigData);

        if (fetchAuthURL.error) {
            setErrorMessage(
                intl.formatMessage({ id: 'oauth.fetchAuthURL.error' })
            );
        } else if (!isEmpty(fetchAuthURL.data)) {
            // This kicks off the call and the success is handled with the onSuccess/onError
            getAuth(fetchAuthURL.data.url, fetchAuthURL.data.state);
        }
    };

    // When loading we need to handle Create and Edit differently
    // For create we want to set defaults so the discriminator and injected values are set
    //      This allows for the best UX when displaying errors. Otherwise we get a bunch of
    //      ajv errors about the schema not matching.
    // For edit we have all the props from the previous version but since they contain
    //      SOPS fields then we know for sure we do not ahve all the required props.
    //      But down below in edit we know to show the Authenticated tag by default since
    //      the user does not need to reauthenticate until they change the Endpoint Config
    useMount(() => {
        if (isEdit) {
            setHasAllRequiredProps(false);
        } else {
            setConfigToDefault();
        }
    });

    // Need to manually set an error to prevent submitting the form
    useEffect(() => {
        const customErrors = [];

        // Used to set an error for the OAuth Renderer
        if (!hasAllRequiredProps) {
            customErrors.push({
                instancePath: path,
                message: `need to complete OAuth`,
                schemaPath: '',
                keyword: '',
                params: {},
            });
        }

        setCustomErrors(customErrors);

        return () => {
            // Make sure we clean up the custom errors if we leave this component
            setCustomErrors([]);
        };
    }, [hasAllRequiredProps, path, setCustomErrors]);

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

                    {(isEdit && draftId) ||
                    (isEdit && !draftId && hasAllRequiredProps) ||
                    (!isEdit && hasAllRequiredProps) ? (
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
