import type { EditButtonProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useState } from 'react';

import { Button, TableCell } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';

function AlertEditButton({ executeQuery, prefix }: EditButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <TableCell>
            <Button
                variant="text"
                onClick={(event) => {
                    event.preventDefault();

                    executeQuery({ requestPolicy: 'network-only' });
                    setOpen(true);
                }}
            >
                <FormattedMessage id="cta.edit" />
            </Button>

            <AlertSubscriptionDialog
                executeQuery={executeQuery}
                headerId="alerts.config.dialog.update.header"
                open={open}
                setOpen={setOpen}
                staticPrefix={prefix}
            />
        </TableCell>
    );
}

export default AlertEditButton;
