import { DataObject } from '@mui/icons-material';
import { Button, Skeleton } from '@mui/material';
import SchemaInferenceDialog from 'components/editor/Bindings/SchemaInference/Dialog';
import { useBindingsEditorStore_collectionData } from 'components/editor/Bindings/Store/hooks';
import { useEntityWorkflow } from 'context/Workflow';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

function SchemaInferenceButton() {
    const workflow = useEntityWorkflow();

    // Bindings Editor Store
    const collectionData = useBindingsEditorStore_collectionData();

    const [open, setOpen] = useState<boolean>(false);

    const openSchemaInferenceDialog = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.preventDefault();

        setOpen(true);
    };

    // Test commit

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
