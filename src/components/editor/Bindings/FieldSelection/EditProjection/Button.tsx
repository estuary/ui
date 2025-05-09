import type { Projection } from 'src/components/editor/Bindings/FieldSelection/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import EditProjectionDialog from 'src/components/editor/Bindings/FieldSelection/EditProjection/Dialog';

interface Props {
    field: string;
    projection: Projection;
}

function EditProjectionButton({ field, projection }: Props) {
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
                    // color: (theme) => theme.palette.text.primary,
                    fontWeight: 400,
                    height: 20,
                    minWidth: 'unset',
                    pb: '4px',
                    pt: 0,
                    px: '3px',
                    textTransform: 'unset',
                }}
            >
                {field}
            </Button>

            <EditProjectionDialog
                field={field}
                open={open}
                setOpen={setOpen}
                projection={projection}
            />
        </>
    );
}

export default EditProjectionButton;
