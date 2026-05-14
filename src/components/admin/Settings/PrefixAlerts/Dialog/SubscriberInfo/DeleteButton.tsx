import type { SubscriptionDependentProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { IconButton, useTheme } from '@mui/material';

import { Xmark } from 'iconoir-react';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { disabledButtonText } from 'src/context/Theme';

const DeleteButton = ({
    subscription: { catalogPrefix, email, id },
}: SubscriptionDependentProps) => {
    const theme = useTheme();

    const prefixErrorsExist = useAlertSubscriptionsStore(
        (state) => state.prefixErrorsExist
    );

    const markSubscriptionForDeletion = useAlertSubscriptionsStore(
        (state) => state.markSubscriptionForDeletion
    );

    const disabled = Boolean(
        prefixErrorsExist || catalogPrefix.length === 0 || email.length === 0
    );

    return (
        <IconButton
            disabled={disabled}
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
                    color: disabled
                        ? disabledButtonText[theme.palette.mode]
                        : theme.palette.text.primary,
                }}
            />
        </IconButton>
    );
};

export default DeleteButton;
