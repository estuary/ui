import type { DialogActionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useMemo } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertMetadata } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertMetadata';
import { hasOwnProperty } from 'src/utils/misc-utils';

const DeleteButton = ({ closeDialog }: DialogActionProps) => {
    const intl = useIntl();
    const { loading, onClick } = useModifyAlertMetadata(closeDialog, true);

    const errorsExist = useAlertSubscriptionsStore(
        (state) => state.emailErrorsExist || state.prefixErrorsExist
    );

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );

    const disabled = useMemo(() => {
        const subscriptions = hasOwnProperty(
            mutableSubscriptionMetadata,
            catalogPrefix
        )
            ? mutableSubscriptionMetadata[catalogPrefix].subscriptions
            : [];

        const emptyEmailExists = subscriptions.some(
            ({ email }) => email.length === 0
        );

        return Boolean(
            errorsExist ||
                loading ||
                catalogPrefix.length === 0 ||
                subscriptions.length === 0 ||
                emptyEmailExists
        );
    }, [catalogPrefix, errorsExist, loading, mutableSubscriptionMetadata]);

    return (
        <Button
            color="error"
            disabled={disabled}
            loading={loading}
            onClick={onClick}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'alerts.config.dialog.cta.deleteAll' })}
        </Button>
    );
};

export default DeleteButton;
