import { useState } from 'react';

import { Button } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';

function AlertGenerateButton() {
    const { ref: semanticCreateNotificationRef } =
        useSemanticLeaf<HTMLButtonElement>('Create Notification');

    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                ref={semanticCreateNotificationRef}
                variant="outlined"
                onClick={(event) => {
                    event.preventDefault();

                    setOpen(true);
                }}
            >
                Create New
            </Button>

            <AlertSubscriptionDialog
                descriptionId="alerts.config.dialog.generate.description"
                headerId="alerts.config.dialog.generate.header"
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}

export default AlertGenerateButton;
