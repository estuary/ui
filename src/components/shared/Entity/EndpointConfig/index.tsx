import { Box } from '@mui/material';
import {
    useEditorStore_editDraftId,
    useEditorStore_setId,
} from 'components/editor/Store';
import AlertBox from 'components/shared/AlertBox';
import EndpointConfigForm from 'components/shared/Entity/EndpointConfig/Form';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfig/Header';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import { useEntityWorkflow } from 'context/Workflow';
import useEvaluateEndpointConfigChanges from 'hooks/comparisons/useEvaluateEndpointConfigChanges';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorTag from 'hooks/useConnectorTag';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { createJSONFormDefaults } from 'services/ajv';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_setEndpointConfig,
    useEndpointConfigStore_setEndpointSchema,
} from 'stores/EndpointConfig';
import { Schema } from 'types';

interface Props {
    connectorImage: string;
    readOnly?: boolean;
}

function EndpointConfig({ connectorImage, readOnly = false }: Props) {
    const intl = useIntl();

    const [connectorId] = useGlobalSearchParams([
        GlobalSearchParams.CONNECTOR_ID,
    ]);

    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'capture_edit' || workflow === 'materialization_edit';

    const { connectorTag, error } = useConnectorTag(connectorImage);

    // Editor Store
    const setDraftId = useEditorStore_setId();

    const editDraftId = useEditorStore_editDraftId();

    // Endpoint Config Store
    const endpointConfig = useEndpointConfigStore_endpointConfig_data();
    const setEndpointConfig = useEndpointConfigStore_setEndpointConfig();

    const setEndpointSchema = useEndpointConfigStore_setEndpointSchema();

    useEffect(() => {
        if (
            connectorId !== connectorTag?.connector_id &&
            connectorTag?.endpoint_spec_schema
        ) {
            const schema =
                connectorTag.endpoint_spec_schema as unknown as Schema;

            setEndpointSchema(schema);
            setEndpointConfig(createJSONFormDefaults(schema));
        }
    }, [
        setEndpointConfig,
        setEndpointSchema,
        connectorId,
        connectorTag?.connector_id,
        connectorTag?.endpoint_spec_schema,
    ]);

    const endpointConfigUnchanged = useEvaluateEndpointConfigChanges(
        editDraftId,
        endpointConfig
    );

    useEffect(() => {
        if (editWorkflow) {
            setDraftId(endpointConfigUnchanged ? editDraftId : null);
        }
    }, [setDraftId, editDraftId, endpointConfigUnchanged, editWorkflow]);

    if (error) {
        return <Error error={error} />;
    } else if (connectorTag) {
        return (
            <WrapperWithHeader
                mountClosed={editWorkflow}
                readOnly={readOnly}
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
