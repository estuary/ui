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

    const resolveWhileMounted = useUnmountPromise();

    const { data: gatewayConfig } = useGatewayAuthToken(
        currentCollection ? [currentCollection] : null
    );

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
                        if (Object.hasOwn(collectionData.spec, 'writeSchema')) {
                            const { writeSchema, ...additionalSpecKeys } =
                                collectionData.spec;

                            setInferredSpec(
                                !isEmpty(response.schema)
                                    ? {
                                          writeSchema:
                                              collectionData.spec.writeSchema,
                                          readSchema: response.schema,
                                          ...additionalSpecKeys,
                                      }
                                    : null
                            );
                        } else {
                            const { schema, ...additionalSpecKeys } =
                                collectionData.spec;

                            setInferredSpec(
                                !isEmpty(response.schema)
                                    ? {
                                          writeSchema:
                                              collectionData.spec.schema,
                                          readSchema: response.schema,
                                          ...additionalSpecKeys,
                                      }
                                    : null
                            );
                        }

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

                <SchemaInferenceDialog
                    collectionData={collectionData}
                    open={open}
                    setOpen={setOpen}
                />
            </>
        ) : (
            <Skeleton variant="rectangular" width={125} />
        );
    }
}

export default SchemaInferenceButton;
