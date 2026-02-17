import { useMemo } from 'react';

import { FormattedMessage } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useUpdateAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useUpdateAlertSubscription';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    closeDialog: () => void;
}

function SaveButton({ closeDialog }: Props) {
    const { loading, onClick } = useUpdateAlertSubscription(closeDialog);

    const inputUncommitted = useAlertSubscriptionsStore(
        (state) => state.inputUncommitted
    );

    const prefix = useAlertSubscriptionsStore((state) => state.prefix);
    const prefixErrorsExist = useAlertSubscriptionsStore(
        (state) => state.prefixErrorsExist
    );

    const subscriptions = useAlertSubscriptionsStore(
        (state) => state.subscriptions
    );

    const disabled = useMemo(
        () =>
            Boolean(
                !hasLength(prefix) ||
                    prefixErrorsExist ||
                    !subscriptions ||
                    inputUncommitted
            ),
        [inputUncommitted, prefix, prefixErrorsExist, subscriptions]
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
}

export default SaveButton;
