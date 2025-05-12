import type { EditProjectionButtonProps } from 'src/components/projections/Edit/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import EditProjectionDialog from 'src/components/projections/Edit/Dialog';

function EditProjectionButton({
    fieldTextStyles,
    field,
    pointer,
}: EditProjectionButtonProps) {
    const [open, setOpen] = useState(false);

    const openDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(true);
    };

    return (
        <>
            <Button
                onClick={openDialog}
                size="small"
                variant="text"
                sx={{
                    borderBottom: (theme) =>
                        `1px dashed ${theme.palette.primary.alpha_50}`,
                    borderRadius: 0,
                    fontWeight: 400,
                    height: 20,
                    minWidth: 'unset',
                    px: '3px',
                    py: '4px',
                    textTransform: 'unset',
                    ...fieldTextStyles,
                }}
            >
                {field}
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
