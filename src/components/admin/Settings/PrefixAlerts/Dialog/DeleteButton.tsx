import type { DialogActionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertSubscription';
import SafeLoadingButton from 'src/components/SafeLoadingButton';

const DeleteButton = ({ closeDialog }: DialogActionProps) => {
    const intl = useIntl();

    const { loading, onClick } = useModifyAlertSubscription(closeDialog, true);

    const prefixErrorsExist = useAlertSubscriptionsStore(
        (state) => state.prefixErrorsExist
    );

    const subscription = useAlertSubscriptionsStore(
        (state) => state.subscription
    );

    return (
        <SafeLoadingButton
            color="error"
            disabled={Boolean(
                prefixErrorsExist ||
                    loading ||
                    subscription.catalogPrefix.length === 0 ||
                    subscription.email.length === 0
            )}
            loading={loading}
            onClick={onClick}
            size="small"
            variant="outlined"
        >
            {intl.formatMessage({ id: 'cta.delete' })}
        </SafeLoadingButton>
    );
};

export default DeleteButton;
