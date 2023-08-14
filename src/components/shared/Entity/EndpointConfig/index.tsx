import { Box, useTheme } from '@mui/material';
import AutoDiscoverySettings from 'components/capture/AutoDiscoverySettings';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import EndpointConfigForm from 'components/shared/Entity/EndpointConfig/Form';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfig/Header';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import useConnectorTag from 'hooks/useConnectorTag';
import { isEmpty, isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useMount, useUnmount } from 'react-use';
import { createJSONFormDefaults } from 'services/ajv';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_previousEndpointConfig_data,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setEndpointConfig,
    useEndpointConfigStore_setEndpointSchema,
    useEndpointConfigStore_setPreviousEndpointConfig,
    useEndpointConfig_setEndpointCanBeEmpty,
    useEndpointConfig_setServerUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import {
    useSidePanelDocsStore_resetState,
    useSidePanelDocsStore_setUrl,
} from 'stores/SidePanelDocs/hooks';
import { Schema } from 'types';

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

    const entityType = useEntityType();

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
    const canBeEmpty = useMemo(() => {
        return (
            !connectorTag?.endpoint_spec_schema.properties ||
            isEmpty(connectorTag.endpoint_spec_schema.properties)
        );
    }, [connectorTag?.endpoint_spec_schema]);

    useEffect(() => {
        setEndpointCanBeEmpty(canBeEmpty);
    }, [canBeEmpty, setEndpointCanBeEmpty]);

    // Storing flag to handle knowing if a config changed
    //  during both create or edit.
    const endpointSchemaChanged = useMemo(
        () =>
            connectorTag?.endpoint_spec_schema &&
            !isEqual(connectorTag.endpoint_spec_schema, endpointSchema),
        [connectorTag?.endpoint_spec_schema, endpointSchema]
    );

    useEffect(() => {
        if (connectorTag?.endpoint_spec_schema && endpointSchemaChanged) {
            // force some new data in
            setServerUpdateRequired(true);
            setEncryptedEndpointConfig({
                data: {},
            });

            // Update the schema
            const schema =
                connectorTag.endpoint_spec_schema as unknown as Schema;
            setEndpointSchema(schema);

            // Generate the defaults and populate the data/errors
            const defaultConfig = createJSONFormDefaults(schema);
            setEndpointConfig(defaultConfig);
            setPreviousEndpointConfig(defaultConfig);
        }
    }, [
        setServerUpdateRequired,
        setEndpointConfig,
        setEndpointSchema,
        setPreviousEndpointConfig,
        connectorTag,
        connectorTag?.endpoint_spec_schema,
        endpointSchemaChanged,
        setEncryptedEndpointConfig,
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
    const setDocsURL = useSidePanelDocsStore_setUrl();
    const sidePanelResetState = useSidePanelDocsStore_resetState();
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

                    <EndpointConfigForm readOnly={readOnly} />

                    {entityType === 'capture' ? (
                        <AutoDiscoverySettings />
                    ) : null}
                </ErrorBoundryWrapper>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
