import { Button, TableCell } from '@mui/material';
import AlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';
import { FormattedMessage } from 'react-intl';

interface Props {
    prefix: string;
}

function AlertEditButton({ prefix }: Props) {
    const { open, setOpen } = useAlertSubscriptionDialog(prefix);

    return (
        <TableCell>
            <Button
                variant="text"
                onClick={(event) => {
                    event.preventDefault();

                    setOpen(true);
                }}
            >
                <FormattedMessage id="cta.edit" />
            </Button>

            <AlertSubscriptionDialog
                headerId="admin.alerts.dialog.update.header"
                open={open}
                setOpen={setOpen}
                staticPrefix={prefix}
            />
        </TableCell>
    );
}

export default AlertEditButton;
