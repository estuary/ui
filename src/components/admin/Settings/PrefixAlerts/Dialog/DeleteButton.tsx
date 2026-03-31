import type { DialogActionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { FormattedMessage } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertSubscription';
import SafeLoadingButton from 'src/components/SafeLoadingButton';

const DeleteButton = ({ closeDialog }: DialogActionProps) => {
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
                    subscription.catalogPrefix.length === 0 ||
                    subscription.email.length === 0
            )}
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
