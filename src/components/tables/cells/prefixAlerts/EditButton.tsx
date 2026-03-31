import type { EditButtonProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useState } from 'react';

import { Button, TableCell } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

function AlertEditButton({
    alertTypes,
    email,
    prefix,
    ...props
}: EditButtonProps) {
    const [open, setOpen] = useState(false);

    const setSubscribedEmail = useAlertSubscriptionsStore(
        (state) => state.setSubscribedEmail
    );

    return (
        <TableCell {...props}>
            <Button
                variant="text"
                onClick={(event) => {
                    event.preventDefault();

                    setSubscribedEmail(email);
                    setOpen(true);
                }}
            >
                <FormattedMessage id="cta.edit" />
            </Button>

            <AlertSubscriptionDialog
                descriptionId="alerts.config.dialog.update.description"
                enableDeletion
                existingAlertTypes={alertTypes}
                headerId="alerts.config.dialog.update.header"
                open={open}
                setOpen={setOpen}
                staticPrefix={prefix}
                staticEmail={email}
            />
        </TableCell>
    );
}

export default AlertEditButton;
