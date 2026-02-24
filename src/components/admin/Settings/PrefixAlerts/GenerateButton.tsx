import type { BaseButtonProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';

function AlertGenerateButton({ executeQuery }: BaseButtonProps) {
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="outlined"
                onClick={(event) => {
                    event.preventDefault();

                    executeQuery({ requestPolicy: 'network-only' });
                    setOpen(true);
                }}
            >
                {intl.formatMessage({ id: 'alerts.config.cta.addAlertMethod' })}
            </Button>

            <AlertSubscriptionDialog
                executeQuery={executeQuery}
                headerId="alerts.config.dialog.generate.header"
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}

export default AlertGenerateButton;
