import { Button } from '@mui/material';
import GenerateAlertDialog from 'components/admin/Settings/PrefixAlerts/generate/Dialog';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

function AlertGenerateButton() {
    const [open, setOpen] = useState(false);

    const openGenerateAlertDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(true);
    };

    return (
        <>
            <Button variant="outlined" onClick={openGenerateAlertDialog}>
                <FormattedMessage id="admin.alerts.cta.addAlertMethod" />
            </Button>

            <GenerateAlertDialog open={open} setOpen={setOpen} />
        </>
    );
}

export default AlertGenerateButton;
