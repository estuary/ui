import { Box } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import EndpointConfigForm from 'components/shared/Entity/EndpointConfig/Form';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfig/Header';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import { useEntityWorkflow } from 'context/Workflow';
import useConnectorTag from 'hooks/useConnectorTag';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useUnmount, useUpdateEffect } from 'react-use';
import { createJSONFormDefaults } from 'services/ajv';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_previousEndpointConfig_data,
    useEndpointConfigStore_setEndpointConfig,
    useEndpointConfigStore_setEndpointSchema,
    useEndpointConfigStore_setPreviousEndpointConfig,
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

function EndpointConfig({
    connectorImage,
    readOnly = false,
    hideBorder,
}: Props) {
    const intl = useIntl();
    const setDocsURL = useSidePanelDocsStore_setUrl();
    const resetState = useSidePanelDocsStore_resetState();

    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'capture_edit' || workflow === 'materialization_edit';

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

    const endpointSchemaChanged = useMemo(
        () =>
            connectorTag?.endpoint_spec_schema &&
            !isEqual(connectorTag.endpoint_spec_schema, endpointSchema),
        [connectorTag?.endpoint_spec_schema, endpointSchema]
    );

    useEffect(() => {
        if (connectorTag?.endpoint_spec_schema && endpointSchemaChanged) {
            const schema =
                connectorTag.endpoint_spec_schema as unknown as Schema;

            setEndpointSchema(schema);

            const defaultConfig = createJSONFormDefaults(schema);

            setEndpointConfig(defaultConfig);
            setPreviousEndpointConfig(defaultConfig);
        }
    }, [
        setEndpointConfig,
        setEndpointSchema,
        setPreviousEndpointConfig,
        connectorTag?.endpoint_spec_schema,
        endpointSchemaChanged,
    ]);

    const endpointConfigUpdated = useMemo(() => {
        return !isEqual(endpointConfig, previousEndpointConfig);
    }, [endpointConfig, previousEndpointConfig]);

    useUpdateEffect(() => {
        setServerUpdateRequired(endpointConfigUpdated);
    }, [setServerUpdateRequired, endpointConfigUpdated]);

    const forceClose = !editWorkflow && draftId !== null;

    useUnmount(() => {
        resetState();
    });

    useEffect(() => {
        if (connectorTag) {
            setDocsURL(
                connectorTag.documentation_url
                //'http://localhost:3001/reference/Connectors/capture-connectors/google-sheets/'
            );
        }
    }, [connectorTag, setDocsURL]);

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
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
