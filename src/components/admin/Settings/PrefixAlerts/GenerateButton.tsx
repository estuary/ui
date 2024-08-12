import { Button } from '@mui/material';
import AlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';
import { FormattedMessage } from 'react-intl';

function AlertGenerateButton() {
    const { open, openGenerateAlertDialog, setOpen, subscriptions } =
        useAlertSubscriptionDialog();

    return (
        <>
            <Button variant="outlined" onClick={openGenerateAlertDialog}>
                <FormattedMessage id="admin.alerts.cta.addAlertMethod" />
            </Button>

            <AlertSubscriptionDialog
                headerId="admin.alerts.dialog.generate.header"
                open={open}
                setOpen={setOpen}
                subscriptions={subscriptions}
            />
        </>
    );
}

export default AlertGenerateButton;
