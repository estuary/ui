import { Button } from '@mui/material';
import EditProjectionDialog from 'src/components/editor/Bindings/FieldSelection/EditProjection/Dialog';
import { Projection } from 'src/components/editor/Bindings/FieldSelection/types';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    operation: 'addProjection' | 'renameField';
    projection: Projection;
}

function EditProjectionButton({ operation, projection }: Props) {
    const [open, setOpen] = useState(false);

    const openDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(true);
    };

    return (
        <>
            <Button size="small" variant="outlined" onClick={openDialog}>
                <FormattedMessage
                    id={`fieldSelection.table.cta.${operation}`}
                />
            </Button>

            <EditProjectionDialog
                open={open}
                operation={operation}
                setOpen={setOpen}
                projection={projection}
            />
        </>
    );
}

export default EditProjectionButton;
