import type { DialogActionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useMemo } from 'react';

import { Button } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertMetadata } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertMetadata';

const DeleteButton = ({ closeDialog }: DialogActionProps) => {
    const { ref: semanticDeleteAllNotificationsRef } =
        useSemanticLeaf<HTMLButtonElement>('Delete All Notifications');

    const { loading, onClick } = useModifyAlertMetadata(closeDialog, true);

    const errorsExist = useAlertSubscriptionsStore(
        (state) =>
            state.prefixErrors.length > 0 ||
            state.mutableSubscriptionMetadata.subscriptions.some(
                ({ emailErrorsExist }) => emailErrorsExist
            )
    );
    const duplicatePrefixExists = useAlertSubscriptionsStore(
        (state) => state.duplicatePrefixExists
    );

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );
    const subscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.subscriptionMetadata
    );

    const disabled = useMemo(() => {
        const { subscriptions } = mutableSubscriptionMetadata;

        const emptyEmailExists = subscriptions.some(
            ({ email }) => email.length === 0
        );

        return Boolean(
            errorsExist ||
                loading ||
                catalogPrefix.length === 0 ||
                subscriptions.length === 0 ||
                emptyEmailExists ||
                !Object.keys(subscriptionMetadata).includes(catalogPrefix) ||
                duplicatePrefixExists
        );
    }, [
        catalogPrefix,
        duplicatePrefixExists,
        errorsExist,
        loading,
        mutableSubscriptionMetadata,
        subscriptionMetadata,
    ]);

    return (
        <Button
            ref={semanticDeleteAllNotificationsRef}
            color="error"
            disabled={disabled}
            loading={loading}
            onClick={onClick}
            size="small"
            variant="outlined"
        >
            Delete Prefix Alerts
        </Button>
    );
};

export default DeleteButton;
