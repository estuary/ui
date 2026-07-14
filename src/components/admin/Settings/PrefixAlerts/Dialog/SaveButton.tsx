import type { DialogActionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useMemo } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertMetadata } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertMetadata';
import { isValidEmail } from 'src/validation';

const SaveButton = ({ closeDialog }: DialogActionProps) => {
    const intl = useIntl();
    const { loading, onClick } = useModifyAlertMetadata(closeDialog);

    const errorsExist = useAlertSubscriptionsStore(
        (state) =>
            state.prefixErrorsExist ||
            state.mutableSubscriptionMetadata.subscriptions.some(
                ({ email, emailErrorsExist }) =>
                    emailErrorsExist || !isValidEmail(email)
            )
    );

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const metadataMissing = useAlertSubscriptionsStore(
        (state) =>
            state.mutableSubscriptionMetadata.subscriptions.length === 0 ||
            state.mutableSubscriptionMetadata.subscriptions.some(
                ({ email }) => email.length === 0
            )
    );

    const disabled = useMemo(
        () =>
            Boolean(
                errorsExist ||
                    loading ||
                    catalogPrefix.length === 0 ||
                    metadataMissing
            ),
        [catalogPrefix, errorsExist, loading, metadataMissing]
    );

    return (
        <Button
            variant="contained"
            size="small"
            disabled={disabled}
            loading={loading}
            onClick={onClick}
        >
            {intl.formatMessage({ id: 'cta.save' })}
        </Button>
    );
};

export default SaveButton;
