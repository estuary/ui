import { useMemo } from 'react';

import { FormattedMessage } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertSubscription';
import SafeLoadingButton from 'src/components/SafeLoadingButton';

interface Props {
    closeDialog: () => void;
}

const DeleteButton = ({ closeDialog }: Props) => {
    const { loading, onClick } = useModifyAlertSubscription(closeDialog, true);

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
            color="error"
            disabled={disabled}
            loading={loading}
            onClick={onClick}
            size="small"
            variant="outlined"
        >
            <FormattedMessage id="cta.delete" />
        </SafeLoadingButton>
    );
};

export default DeleteButton;
