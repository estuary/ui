import type { BaseProjectionProps } from 'src/components/projections/types';
import type { BaseButtonProps } from 'src/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import EditProjectionDialog from 'src/components/projections/Edit/Dialog';

function EditProjectionButton({
    disabled,
    field,
    pointer,
}: BaseButtonProps & BaseProjectionProps) {
    const [open, setOpen] = useState(false);

    const openDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(true);
    };

    return (
        <>
            <Button
                disabled={disabled}
                onClick={openDialog}
                size="small"
                variant="outlined"
            >
                Rename
            </Button>

            <EditProjectionDialog
                field={field}
                open={open}
                setOpen={setOpen}
                pointer={pointer}
            />
        </>
    );
}

export default EditProjectionButton;
