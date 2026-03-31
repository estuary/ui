import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';

function AlertGenerateButton() {
    const intl = useIntl();

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
                {intl.formatMessage({ id: 'alerts.config.cta.addAlertMethod' })}
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
