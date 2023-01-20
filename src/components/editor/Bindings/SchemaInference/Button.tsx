import { DataObject } from '@mui/icons-material';
import { Button, Skeleton } from '@mui/material';
import SchemaInferenceDialog from 'components/editor/Bindings/SchemaInference/Dialog';
import {
    useBindingsEditorStore_collectionData,
    useBindingsEditorStore_setDocumentsRead,
    useBindingsEditorStore_setInferredSpec,
    useBindingsEditorStore_setLoadingInferredSchema,
} from 'components/editor/Bindings/Store/hooks';
import { useEntityWorkflow } from 'context/Workflow';
import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useUnmountPromise } from 'react-use';
import getInferredSchema from 'services/schema-inference';
import { useResourceConfig_currentCollection } from 'stores/ResourceConfig/hooks';

function SchemaInferenceButton() {
    const workflow = useEntityWorkflow();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();

    const setInferredSpec = useBindingsEditorStore_setInferredSpec();

    const setDocumentsRead = useBindingsEditorStore_setDocumentsRead();

    const setLoadingInferredSchema =
        useBindingsEditorStore_setLoadingInferredSchema();

    // Resource Config Store
    const currentCollection = useResourceConfig_currentCollection();

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
                        let inferredSchema = null;
                        if (Object.hasOwn(collectionData.spec, 'writeSchema')) {
                            const { ...additionalSpecKeys } =
                                collectionData.spec;

                            inferredSchema = !isEmpty(response.schema)
                                ? {
                                      ...additionalSpecKeys,
                                      writeSchema:
                                          collectionData.spec.writeSchema,
                                      readSchema: response.schema,
                                  }
                                : null;
                        } else {
                            // Removing schema from the object
                            const { schema, ...additionalSpecKeys } =
                                collectionData.spec;

                            inferredSchema = !isEmpty(response.schema)
                                ? {
                                      ...additionalSpecKeys,
                                      writeSchema: collectionData.spec.schema,
                                      readSchema: response.schema,
                                  }
                                : null;
                        }

                        setInferredSpec(inferredSchema);
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

    if (workflow === 'capture_create') {
        return null;
    } else {
        return collectionData ? (
            <>
                <Button
                    startIcon={<DataObject />}
                    onClick={openSchemaInferenceDialog}
                >
                    <FormattedMessage id="workflows.collectionSelector.cta.schemaInference" />
                </Button>

                <SchemaInferenceDialog open={open} setOpen={setOpen} />
            </>
        ) : (
            <Skeleton variant="rectangular" width={125} />
        );
    }
}

export default SchemaInferenceButton;
