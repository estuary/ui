import { useState } from 'react';

import { Button } from '@mui/material';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';

function AlertGenerateButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
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
