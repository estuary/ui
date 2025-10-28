import { Button, TableCell } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionDialog';

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
                headerId="alerts.config.dialog.update.header"
                open={open}
                setOpen={setOpen}
                staticPrefix={prefix}
            />
        </TableCell>
    );
}

export default AlertEditButton;
