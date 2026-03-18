import type { DialogActionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useMemo } from 'react';

import { FormattedMessage } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertSubscription';
import SafeLoadingButton from 'src/components/SafeLoadingButton';

const SaveButton = ({ closeDialog }: DialogActionProps) => {
    const { loading, onClick } = useModifyAlertSubscription(closeDialog);

    const prefixErrorsExist = useAlertSubscriptionsStore(
        (state) => state.prefixErrorsExist
    );

    const subscription = useAlertSubscriptionsStore(
        (state) => state.subscription
    );

    const disabled = useMemo(
        () =>
            Boolean(
                prefixErrorsExist ||
                    subscription.catalogPrefix.length === 0 ||
                    subscription.email.length === 0
            ),
        [prefixErrorsExist, subscription.catalogPrefix, subscription.email]
    );

    return (
        <SafeLoadingButton
            variant="contained"
            size="small"
            disabled={disabled}
            loading={loading}
            onClick={onClick}
        >
            <FormattedMessage id="cta.save" />
        </SafeLoadingButton>
    );
};

export default SaveButton;
