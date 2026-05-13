import { IconButton, useTheme } from '@mui/material';

import { Xmark } from 'iconoir-react';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertSubscription';

const DeleteButton = () => {
    const theme = useTheme();

    const { loading, onClick } = useModifyAlertSubscription(() => {}, true);

    const prefixErrorsExist = useAlertSubscriptionsStore(
        (state) => state.prefixErrorsExist
    );

    const subscription = useAlertSubscriptionsStore(
        (state) => state.subscription
    );

    return (
        <IconButton
            disabled={Boolean(
                prefixErrorsExist ||
                    loading ||
                    subscription.catalogPrefix.length === 0 ||
                    subscription.email.length === 0
            )}
            loading={loading}
            onClick={onClick}
            size="small"
        >
            <Xmark style={{ color: theme.palette.text.primary }} />
        </IconButton>
    );
};

export default DeleteButton;
