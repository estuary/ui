import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';

function AlertGenerateButton() {
    const intl = useIntl();
    const { open, setOpen } = useAlertSubscriptionDialog();

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
                headerId="alerts.config.dialog.generate.header"
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}

export default AlertGenerateButton;
