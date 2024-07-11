import { Button } from '@mui/material';
import SchemaInferenceDialog from 'components/editor/Bindings/SchemaInference/Dialog';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_schemaInferenceDisabled,
    useBindingsEditorStore_setDocumentsRead,
    useBindingsEditorStore_setInferredSpec,
    useBindingsEditorStore_setLoadingInferredSchema,
} from 'components/editor/Bindings/Store/hooks';
import { useEntityWorkflow } from 'context/Workflow';
import useGatewayAuthToken from 'hooks/gatewayAuthToken/useGatewayAuthToken';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useUnmountPromise } from 'react-use';
import getInferredSchema from 'services/schema-inference';
import { useBinding_currentCollection } from 'stores/Binding/hooks';
import { moveUpdatedSchemaToReadSchema } from 'utils/schema-utils';

function SchemaInferenceButton() {
    const workflow = useEntityWorkflow();

    // Binding Store
    const currentCollection = useBinding_currentCollection();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();

    const schemaInferenceDisabled =
        useBindingsEditorStore_schemaInferenceDisabled();

    const setInferredSpec = useBindingsEditorStore_setInferredSpec();

    const setDocumentsRead = useBindingsEditorStore_setDocumentsRead();

    const setLoadingInferredSchema =
        useBindingsEditorStore_setLoadingInferredSchema();

    const [open, setOpen] = useState<boolean>(false);

    const { data: gatewayConfig } = useGatewayAuthToken(
        currentCollection ? [currentCollection] : null
    );

    const resolveWhileMounted = useUnmountPromise();

    const openSchemaInferenceDialog = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.preventDefault();

        setLoadingInferredSchema(true);

        if (currentCollection && gatewayConfig?.gateway_url && collectionData) {
            resolveWhileMounted(
                getInferredSchema(gatewayConfig, currentCollection)
            )
                .then(
                    (response) => {
                        const inferredSpec = moveUpdatedSchemaToReadSchema(
                            collectionData,
                            response.schema
                        );

                        setInferredSpec(inferredSpec);
                        setDocumentsRead(response.documents_read);
                    },
                    (error) => {
                        setInferredSpec(error?.code === 404 ? null : undefined);

                        setDocumentsRead(undefined);
                    }
                )
                .finally(() => setLoadingInferredSchema(false));
        } else {
            setLoadingInferredSchema(false);
        }

        setOpen(true);
    };

    if (workflow === 'capture_create' || schemaInferenceDisabled) {
        return null;
    } else {
        return collectionData ? (
            <>
                <Button variant="text" onClick={openSchemaInferenceDialog}>
                    <FormattedMessage id="workflows.collectionSelector.cta.schemaInference" />
                </Button>

                <SchemaInferenceDialog open={open} setOpen={setOpen} />
            </>
        ) : null;
    }
}

export default SchemaInferenceButton;
