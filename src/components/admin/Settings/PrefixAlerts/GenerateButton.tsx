import { Button, Dialog, DialogContent } from '@mui/material';
import AlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

function AlertGenerateButton() {
    const { open, openGenerateAlertDialog, setOpen, subscriptions } =
        useAlertSubscriptionDialog();

    console.log(subscriptions);

    return (
        <>
            <Button variant="outlined" onClick={openGenerateAlertDialog}>
                <FormattedMessage id="admin.alerts.cta.addAlertMethod" />
            </Button>

            {subscriptions ? (
                <AlertSubscriptionDialog
                    headerId="admin.alerts.dialog.generate.header"
                    open={open}
                    setOpen={setOpen}
                    subscriptions={subscriptions}
                />
            ) : (
                <Dialog
                    open={open}
                    maxWidth="md"
                    fullWidth
                    // aria-labelledby={TITLE_ID}
                >
                    <DialogContent>
                        <AlertBox severity="error">
                            <FormattedMessage id="admin.alerts.error.initializationFailed" />
                        </AlertBox>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

export default AlertGenerateButton;
