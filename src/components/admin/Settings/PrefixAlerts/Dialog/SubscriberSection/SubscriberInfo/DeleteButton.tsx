import type { SubscriptionDependentProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { IconButton, useTheme } from '@mui/material';

import { Xmark } from 'iconoir-react';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';

const DeleteButton = ({
    subscription: { catalogPrefix, id },
}: SubscriptionDependentProps) => {
    const theme = useTheme();

    const markSubscriptionForDeletion = useAlertSubscriptionsStore(
        (state) => state.markSubscriptionForDeletion
    );

    return (
        <IconButton
            onClick={(event) => {
                event.stopPropagation();

                markSubscriptionForDeletion(catalogPrefix, id);
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
                    color: theme.palette.text.primary,
                }}
            />
        </IconButton>
    );
};

export default DeleteButton;
