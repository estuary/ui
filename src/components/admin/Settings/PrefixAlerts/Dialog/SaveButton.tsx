import type { DialogActionProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useMemo } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useModifyAlertSubscription } from 'src/components/admin/Settings/PrefixAlerts/useModifyAlertSubscription';
import { hasOwnProperty } from 'src/utils/misc-utils';

const SaveButton = ({ closeDialog }: DialogActionProps) => {
    const intl = useIntl();
    const { loading, onClick } = useModifyAlertSubscription(closeDialog);

    const errorsExist = useAlertSubscriptionsStore(
        (state) => state.emailErrorsExist || state.prefixErrorsExist
    );

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const emptyEmailExists = useAlertSubscriptionsStore((state) =>
        state.catalogPrefix.length > 0 &&
        hasOwnProperty(state.mutableSubscriptionMetadata, state.catalogPrefix)
            ? state.mutableSubscriptionMetadata[
                  state.catalogPrefix
              ].subscriptions.some(({ email }) => email.length === 0)
            : false
    );

    const disabled = useMemo(
        () =>
            Boolean(
                errorsExist ||
                    loading ||
                    catalogPrefix.length === 0 ||
                    emptyEmailExists
            ),
        [catalogPrefix, emptyEmailExists, errorsExist, loading]
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
