import { Box } from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import EndpointConfigForm from 'components/shared/Entity/EndpointConfig/Form';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfig/Header';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorTag from 'hooks/useConnectorTag';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useUpdateEffect } from 'react-use';
import { createJSONFormDefaults } from 'services/ajv';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_previousEndpointConfig_data,
    useEndpointConfigStore_setEndpointConfig,
    useEndpointConfigStore_setEndpointSchema,
    useEndpointConfigStore_setPreviousEndpointConfig,
    useEndpointConfig_setServerUpdateRequired,
} from 'stores/EndpointConfig';
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

    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'capture_edit' || workflow === 'materialization_edit';

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

    const setEndpointSchema = useEndpointConfigStore_setEndpointSchema();

    const setServerUpdateRequired = useEndpointConfig_setServerUpdateRequired();

    useEffect(() => {
        if (
            connectorId !== connectorTag?.connector_id &&
            connectorTag?.endpoint_spec_schema
        ) {
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
        connectorId,
        connectorTag?.connector_id,
        connectorTag?.endpoint_spec_schema,
    ]);

    const endpointConfigUpdated = useMemo(() => {
        return !isEqual(endpointConfig, previousEndpointConfig);
    }, [endpointConfig, previousEndpointConfig]);

    useUpdateEffect(() => {
        setServerUpdateRequired(endpointConfigUpdated);
    }, [setServerUpdateRequired, endpointConfigUpdated]);

    const forceClose = !editWorkflow && draftId !== null;

    if (error) {
        return <Error error={error} />;
    } else if (connectorTag) {
        return (
            <WrapperWithHeader
                mountClosed={editWorkflow}
                forceClose={forceClose}
                readOnly={readOnly}
                hideBorder={hideBorder}
                header={
                    <EndpointConfigHeader
                        docsPath={connectorTag.documentation_url}
                    />
                }
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
