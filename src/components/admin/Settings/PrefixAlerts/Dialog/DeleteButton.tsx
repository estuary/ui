import { IconButton, useTheme } from '@mui/material';

import { Xmark } from 'iconoir-react';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { disabledButtonText } from 'src/context/Theme';

const DeleteButton = () => {
    const theme = useTheme();

    const prefixErrorsExist = useAlertSubscriptionsStore(
        (state) => state.prefixErrorsExist
    );

    const subscription = useAlertSubscriptionsStore(
        (state) => state.subscription
    );

    const disabled = Boolean(
        prefixErrorsExist ||
            subscription.catalogPrefix.length === 0 ||
            subscription.email.length === 0
    );

    return (
        <IconButton
            disabled={disabled}
            onClick={() => {}}
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
