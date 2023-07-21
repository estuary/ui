import { useState } from 'react';

import { FormattedMessage } from 'react-intl';

import { Button } from '@mui/material';

import SQLDataPreviewDialog from 'components/transformation/create/Schema/SQLDataPreview/Dialog';

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
                <FormattedMessage id="newTransform.schema.cta.generatePreview" />
            </Button>

            <SQLDataPreviewDialog open={open} setOpen={setOpen} />
        </>
    );
}

export default SQLDataPreviewButton;
