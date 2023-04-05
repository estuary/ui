import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import FullPageSpinner from 'components/fullPage/Spinner';
import { useEntityWorkflow } from 'context/Workflow';
import { optionExists } from 'forms/renderers/Overrides/testers/testers';
import { startCase } from 'lodash';
import { useEffect, useMemo } from 'react';
import GoogleButton from 'react-google-button';
import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';
import { useEndpointConfigStore_setEndpointCustomErrors } from 'stores/EndpointConfig/hooks';
import { Options } from 'types/jsonforms';
import { hasLength } from 'utils/misc-utils';
import {
    getDefaultValue,
    getDiscriminator,
} from '../Overrides/material/complex/MaterialOneOfRenderer_Discriminator';
import { FAKE_DEFAULTS, NO_PROVIDER } from './shared';
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

    // Fetch what we need from stores
    // const endpointConfigChanged = useEndpointConfigStore_changed();
    const setCustomErrors = useEndpointConfigStore_setEndpointCustomErrors();

    // Used to make a better UX for users editing a config
    const draftId = useEditorStore_id();
    const workflow = useEntityWorkflow();
    const isEdit =
        workflow === 'capture_edit' || workflow === 'materialization_edit';

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

    const setConfigToDefault = () => {
        const defaults = getDefaultValue(
            schema.properties,
            discriminatorProperty
        );
        handleChange(onChangePath, {
            ...defaults,
            ...FAKE_DEFAULTS,
        });
    };

    const { hasAllRequiredProps, setHasAllRequiredProps } =
        useAllRequiredPropCheck(
            data,
            options,
            onChangePath,
            discriminatorProperty
        );

    const { errorMessage, openPopUp, loading } = useOauthHandler(
        provider,
        (tokenResponse: any) => {
            handleChange(onChangePath, {
                ...FAKE_DEFAULTS,
                ...(!hasOwnPathProp ? data?.[onChangePath] : data),
                ...tokenResponse.data,
            });
        }
    );

    // When loading we need to handle Create and Edit differently
    // For create we want to set defaults so the discriminator and injected values are set
    //      This allows for the best UX when displaying errors. Otherwise we get a bunch of
    //      ajv errors about the schema not matching.
    // For edit we have all the props from the previous version but since they contain
    //      SOPS fields then we know for sure we do not have all the required props.
    //      But down below in edit we know to show the Authenticated tag by default since
    //      the user does not need to reauthenticate until they change the Endpoint Config
    useMount(() => {
        if (isEdit) {
            console.log('setHasAllRequiredProps', { val: false });

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

        console.log('Oauth: customErrors', { customErrors });

        setCustomErrors(customErrors);

        return () => {
            // Make sure we clean up the custom errors if we leave this component
            setCustomErrors([]);
        };
    }, [hasAllRequiredProps, path, setCustomErrors]);

    console.log('oauth', {
        isEdit,
        draftId,
        hasAllRequiredProps,
    });

    const showAuthenticated =
        // !endpointConfigChanged() ||
        (isEdit && draftId) ||
        (isEdit && !draftId && hasAllRequiredProps) ||
        (!isEdit && hasAllRequiredProps);

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
