import { useState } from 'react';

import { Button } from '@mui/material';

import SQLDataPreviewDialog from 'src/components/transformation/create/Schema/SQLDataPreview/Dialog';

function SQLDataPreviewButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="text"
                onClick={() => {
                    setOpen(true);
                }}
            >
                Preview
            </Button>

            <SQLDataPreviewDialog open={open} setOpen={setOpen} />
        </>
    );
}

export default SQLDataPreviewButton;
