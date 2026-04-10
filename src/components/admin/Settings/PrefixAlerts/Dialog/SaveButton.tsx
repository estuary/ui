import type { DialogActionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useMemo } from 'react';

import { Button } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertSubscription';

const SaveButton = ({ closeDialog }: DialogActionProps) => {
    const intl = useIntl();
    const { loading, onClick } = useModifyAlertSubscription(closeDialog);

    const errorsExist = useAlertSubscriptionsStore(
        (state) => state.emailErrorsExist || state.prefixErrorsExist
    );

    const subscription = useAlertSubscriptionsStore(
        (state) => state.subscription
    );

    const disabled = useMemo(
        () =>
            Boolean(
                errorsExist ||
                    loading ||
                    subscription.catalogPrefix.length === 0 ||
                    subscription.email.length === 0
            ),
        [errorsExist, loading, subscription.catalogPrefix, subscription.email]
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
