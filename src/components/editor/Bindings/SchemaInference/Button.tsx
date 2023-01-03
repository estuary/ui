import { DataObject } from '@mui/icons-material';
import { Button, Skeleton } from '@mui/material';
import SchemaInferenceDialog from 'components/editor/Bindings/SchemaInference/Dialog';
import { CollectionData } from 'components/editor/Bindings/types';
import { useEntityWorkflow } from 'context/Workflow';
import { Dispatch, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    collectionData: CollectionData | null | undefined;
    setCollectionData: Dispatch<
        SetStateAction<CollectionData | null | undefined>
    >;
}

function SchemaInferenceButton({ collectionData, setCollectionData }: Props) {
    const workflow = useEntityWorkflow();

    const [open, setOpen] = useState<boolean>(false);

    const openSchemaInferenceDialog = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.preventDefault();

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
                    setCollectionData={setCollectionData}
                />
            </>
        ) : (
            <Skeleton variant="rectangular" width={125} />
        );
    }
}

export default SchemaInferenceButton;
