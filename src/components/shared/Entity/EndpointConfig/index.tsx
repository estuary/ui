import { useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import { isEqual } from 'lodash';
import { useIntl } from 'react-intl';
import { useMount, useUnmount } from 'react-use';

import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import EndpointConfigForm from 'src/components/shared/Entity/EndpointConfig/Form';
import EndpointConfigHeader from 'src/components/shared/Entity/EndpointConfig/Header';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import Error from 'src/components/shared/Error';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useEntityWorkflow } from 'src/context/Workflow';
import useConnectorTag from 'src/hooks/connectors/useConnectorTag';
import { createJSONFormDefaults } from 'src/services/ajv';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_setEndpointCanBeEmpty,
    useEndpointConfig_setServerUpdateRequired,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_previousEndpointConfig_data,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setEndpointConfig,
    useEndpointConfigStore_setEndpointSchema,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';
import { configCanBeEmpty } from 'src/utils/misc-utils';

interface Props {
    connectorImage: string;
    readOnly?: boolean;
    hideBorder?: boolean;
}

const DOCUSAURUS_THEME = 'docusaurus-theme';

function EndpointConfig({
    connectorImage,
    readOnly = false,
    hideBorder,
}: Props) {
    // General hooks
    const intl = useIntl();
    const theme = useTheme();

    // The useConnectorTag hook can accept a connector ID or a connector tag ID.
    const { connectorTag, error } = useConnectorTag(connectorImage);

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Endpoint Config Store
    const endpointConfig = useEndpointConfigStore_endpointConfig_data();
    const setEndpointConfig = useEndpointConfigStore_setEndpointConfig();
    const previousEndpointConfig =
        useEndpointConfigStore_previousEndpointConfig_data();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();
    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const setEndpointSchema = useEndpointConfigStore_setEndpointSchema();
    const setServerUpdateRequired = useEndpointConfig_setServerUpdateRequired();
    const setEndpointCanBeEmpty = useEndpointConfig_setEndpointCanBeEmpty();
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

    const unsupportedConnectorVersion = useDetailsFormStore(
        (state) => state.unsupportedConnectorVersion
    );

    // Workflow related props
    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'capture_edit' || workflow === 'materialization_edit';

    // Only force close if there are no errors so users can see fields with issues
    // Also, this helps a bit so when a user is creating a materialization and
    //  opens the collection editor this section will _probably_ not close
    const forceClose =
        !editWorkflow && draftId !== null && !endpointConfigErrorsExist;

    // Storing if this endpointConfig can be empty or not
    //  If so we know there will never be a "change" to the endpoint config
    const canBeEmpty = useMemo(
        () => configCanBeEmpty(connectorTag?.endpoint_spec_schema),
        [connectorTag?.endpoint_spec_schema]
    );

    useEffect(() => {
        setEndpointCanBeEmpty(canBeEmpty);
    }, [canBeEmpty, setEndpointCanBeEmpty]);

    // Storing flag to handle knowing if a config changed
    //  during both create or edit.
    const [resetEndpointConfig, updateEndpointSchema] = useMemo(() => {
        let resetConfig = false;
        let updateSchema = false;

        const schemaChanged = Boolean(
            connectorTag?.endpoint_spec_schema &&
                !isEqual(connectorTag.endpoint_spec_schema, endpointSchema)
        );

        if (editWorkflow) {
            // We do want to reset the schema if it is known to be unsupported and
            //   the schema has changed. Sometimes connectors updatea  version
            //   but the schema they provide for endpoint config has not changed
            updateSchema = unsupportedConnectorVersion && schemaChanged;

            // In edit we never want to clear the config a user has provided. This way
            //  they do not lose anything they have provided. This can cause some
            //  possible side effects where during edit the connector tag is upgraded to
            //  the latest (because they were using an unsupported one) and now the
            //  data has fields that are no longer used. This should be okay because
            //  connector schema changes should be backwards compatible (as of Q1 2024)
            resetConfig = false;
        } else {
            // TODO (create load) this should not be true anymore. The user cannot change the connector
            //  but without this the create flow will not load in.

            // In create if the schema changed it probably means the user selected
            //  a different connector in the dropdown. So we need to clear out data
            //  and update the schema
            updateSchema = schemaChanged;
            resetConfig = schemaChanged;
        }

        return [resetConfig, updateSchema];
    }, [
        connectorTag?.endpoint_spec_schema,
        editWorkflow,
        endpointSchema,
        unsupportedConnectorVersion,
    ]);

    useEffect(() => {
        const runUpdates = async () => {
            const schema = connectorTag?.endpoint_spec_schema;

            // Make sure we have a schema to use otherwise we cannot
            //  populate data or set the schema. This should never really
            //  happen here but being safe.
            if (!schema) {
                return;
            }

            // Update the schema if needed
            if (updateEndpointSchema) {
                await setEndpointSchema(schema);
            }

            if (resetEndpointConfig) {
                // TODO (possible - endpoint config) we might want to move the serverUpdateRequired
                //   call out of this block and set it if either of the flags are true. We can decide that later.
                //    In create - if we clear out the configurations we also update the schema
                //    In edit - we never clear the config and update the schema only if it is unsupported
                //      if we are moving up an unsupported version then we let the user continue
                //      with their existing config. If they have to enter new fields then the form will
                //      detect the change and force them to click next anyway for now (Q1 2024)
                setServerUpdateRequired(true);

                // Clear out the encrypted config because we are requiring a server update and
                //  thus we do not need this to check if that clicked is required again.
                setEncryptedEndpointConfig({
                    data: {},
                });

                // After the schema change we can prefill the data by generating
                //  the defaults and populate the data/errors. The two set functions
                //  will automatically generate a default but we can just call it once
                //  and pass it along (to save a tiny bit of processing)
                const defaultConfig = createJSONFormDefaults(schema);
                setEndpointConfig(defaultConfig);

                // TODO (endpoint header errors / server update required)
                // I think this is a mistake when initially loading create. As the previous endpoint config
                //  at that point is nothing. This extra call causes some issues with showing the error
                //  notification properly. But it feels like removing this is a pretty big change.
                setPreviousEndpointConfig(defaultConfig);
            }
        };

        void runUpdates();
    }, [
        connectorTag?.endpoint_spec_schema,
        resetEndpointConfig,
        setEncryptedEndpointConfig,
        setEndpointConfig,
        setEndpointSchema,
        setPreviousEndpointConfig,
        setServerUpdateRequired,
        updateEndpointSchema,
    ]);

    // Controlling if we need to show the generate button again
    const endpointConfigUpdated = useMemo(() => {
        return canBeEmpty
            ? false
            : !isEqual(endpointConfig, previousEndpointConfig);
    }, [canBeEmpty, endpointConfig, previousEndpointConfig]);
    useEffect(() => {
        setServerUpdateRequired(endpointConfigUpdated);
    }, [setServerUpdateRequired, endpointConfigUpdated]);

    // Populating/handling the side panel docs url
    const [setDocsURL, sidePanelResetState] = useSidePanelDocsStore((state) => [
        state.setUrl,
        state.resetState,
    ]);
    useUnmount(() => {
        sidePanelResetState();
    });
    useEffect(() => {
        if (connectorTag) {
            const concatSymbol = connectorTag.documentation_url.includes('?')
                ? '&'
                : '?';

            setDocsURL(
                `${connectorTag.documentation_url}${concatSymbol}${DOCUSAURUS_THEME}=${theme.palette.mode}`
            );
        }

        // We do not want to trigger this if the theme changes so we just use the theme at load
        //  because we fire a message to the docs when the theme changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectorTag, setDocsURL]);

    // Default serverUpdateRequired for Create
    //  This prevents us from sending the empty object to get encrypted
    //  Handles an edgecase where the user submits the endpoint config
    //      with all the default properties (hello world).
    useMount(() => {
        if (!editWorkflow) {
            setServerUpdateRequired(true);
        }
    });

    if (error) {
        return <Error error={error} />;
    } else if (connectorTag) {
        return (
            <WrapperWithHeader
                mountClosed={editWorkflow}
                forceClose={forceClose}
                readOnly={readOnly}
                hideBorder={hideBorder}
                header={<EndpointConfigHeader />}
            >
                <ErrorBoundryWrapper>
                    {readOnly ? (
                        <Box sx={{ mb: 3 }}>
                            <AlertBox severity="info" short>
                                {intl.formatMessage({
                                    id: 'entityEdit.alert.endpointConfigDisabled',
                                })}
                            </AlertBox>
                        </Box>
                    ) : null}

                    {canBeEmpty ? (
                        <Box sx={{ mb: 3 }}>
                            <AlertBox severity="info" short>
                                {intl.formatMessage({
                                    id: 'workflows.alert.endpointConfigEmpty',
                                })}
                            </AlertBox>
                        </Box>
                    ) : null}

                    <EndpointConfigForm readOnly={readOnly} />
                </ErrorBoundryWrapper>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
