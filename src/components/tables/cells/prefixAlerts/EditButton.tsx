import type { EditButtonProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useState } from 'react';

import { Button, TableCell } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import AlertSubscriptionDialog from 'src/components/admin/Settings/PrefixAlerts/Dialog';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

function AlertEditButton({ prefix, ...props }: EditButtonProps) {
    const { ref: semanticEditNotificationsRef } =
        useSemanticLeaf<HTMLButtonElement>('Edit Notifications');

    const setIsEditFlow = useAlertSubscriptionsStore(
        (state) => state.setIsEditFlow
    );

    const [open, setOpen] = useState(false);

    return (
        <TableCell {...props}>
            <Button
                ref={semanticEditNotificationsRef}
                variant="text"
                onClick={(event) => {
                    event.preventDefault();

                    setIsEditFlow(true);
                    setOpen(true);
                }}
            >
                Edit
            </Button>

            <AlertSubscriptionDialog
                descriptionId="alerts.config.dialog.update.description"
                enableDeletion
                headerId="alerts.config.dialog.update.header"
                open={open}
                setOpen={setOpen}
                staticPrefix={prefix}
            />
        </TableCell>
    );
}

export default AlertEditButton;
