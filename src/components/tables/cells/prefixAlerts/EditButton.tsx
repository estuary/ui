import { Button, TableCell } from '@mui/material';
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
        <TableCell>
            <Button variant="text" onClick={openGenerateAlertDialog}>
                <FormattedMessage id="cta.edit" />
            </Button>

            {subscriptions ? (
                <AlertSubscriptionDialog
                    headerId="admin.alerts.dialog.update.header"
                    open={open}
                    setOpen={setOpen}
                    subscriptions={subscriptions}
                    staticPrefix={prefix}
                />
            ) : null}
        </TableCell>
    );
}

export default AlertEditButton;
