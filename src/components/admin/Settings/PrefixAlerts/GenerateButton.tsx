import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';

function AlertGenerateButton() {
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
                <FormattedMessage id="admin.alerts.cta.addAlertMethod" />
            </Button>

            <AlertSubscriptionDialog
                headerId="admin.alerts.dialog.generate.header"
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}

export default AlertGenerateButton;
