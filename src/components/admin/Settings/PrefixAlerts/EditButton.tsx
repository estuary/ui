import { Button } from '@mui/material';
import AlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';
import { FormattedMessage } from 'react-intl';

interface Props {
    prefix: string;
}

function AlertEditButton({ prefix }: Props) {
    const { open, openGenerateAlertDialog, setOpen, subscriptions } =
        useAlertSubscriptionDialog(prefix);

    return (
        <>
            <Button variant="text" onClick={openGenerateAlertDialog}>
                <FormattedMessage id="cta.edit" />
            </Button>

            {subscriptions === null ? null : (
                <AlertSubscriptionDialog
                    headerId="admin.alerts.dialog.update.header"
                    open={open}
                    setOpen={setOpen}
                    subscriptions={subscriptions}
                    staticPrefix={prefix}
                />
            )}
        </>
    );
}

export default AlertEditButton;
