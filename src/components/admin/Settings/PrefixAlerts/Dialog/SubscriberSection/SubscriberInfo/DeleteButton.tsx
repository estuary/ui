import type { SubscriptionDependentProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { IconButton, useTheme } from '@mui/material';

import { Xmark } from 'iconoir-react';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const DeleteButton = ({ subscription: { id } }: SubscriptionDependentProps) => {
    const theme = useTheme();

    const duplicatePrefixExists = useAlertSubscriptionsStore(
        (state) => state.duplicatePrefixExists
    );
    const markSubscriptionForDeletion = useAlertSubscriptionsStore(
        (state) => state.markSubscriptionForDeletion
    );

    const disabledButtonColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[400]
            : theme.palette.grey[600];

    return (
        <IconButton
            disabled={duplicatePrefixExists}
            onClick={(event) => {
                event.stopPropagation();

                markSubscriptionForDeletion(id);
            }}
            size="small"
            sx={{
                display: 'inline-flex',
                mr: '3px',
                mt: '4px',
            }}
        >
            <Xmark
                style={{
                    color: duplicatePrefixExists
                        ? disabledButtonColor
                        : theme.palette.text.primary,
                }}
            />
        </IconButton>
    );
};

export default DeleteButton;
