import type { SubscriptionMetadata } from 'src/components/admin/Settings/PrefixAlerts/types';

import { Stack, Typography } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { useIntl } from 'react-intl';

import SubscriberInfo from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { hasOwnProperty } from 'src/utils/misc-utils';

const SubscriberSection = () => {
    const intl = useIntl();

    const subscriptionMetadata: SubscriptionMetadata =
        useAlertSubscriptionsStore(
            useShallow((state) =>
                state.catalogPrefix.length > 0 &&
                hasOwnProperty(state.subscriptionMetadata, state.catalogPrefix)
                    ? state.subscriptionMetadata[state.catalogPrefix]
                    : { settings: {}, subscriptions: [] }
            )
        );

    return (
        <Stack spacing="10px" style={{ width: '100%' }}>
            <Typography style={{ fontWeight: 500, marginBottom: 8 }}>
                {intl.formatMessage(
                    { id: 'alerts.config.dialog.label.subscribers' },
                    { count: subscriptionMetadata.subscriptions.length }
                )}
            </Typography>

            {subscriptionMetadata.subscriptions.map(
                ({ alertTypes, catalogPrefix, email }, index) => (
                    <SubscriberInfo
                        alertTypes={alertTypes}
                        email={email}
                        key={`${catalogPrefix}-${email}-${index}`}
                    />
                )
            )}
        </Stack>
    );
};

export default SubscriberSection;
