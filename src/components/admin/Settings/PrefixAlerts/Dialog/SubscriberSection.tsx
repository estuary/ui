import type { SubscriptionMetadata } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SubscriberInfo from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { hasOwnProperty } from 'src/utils/misc-utils';

const SubscriberSection = () => {
    const intl = useIntl();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const subscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.subscriptionMetadata
    );

    const targetSubscriptionMetadata: SubscriptionMetadata = useMemo(
        () =>
            hasOwnProperty(subscriptionMetadata, catalogPrefix)
                ? subscriptionMetadata[catalogPrefix]
                : { settings: {}, subscriptions: [] },
        [catalogPrefix, subscriptionMetadata]
    );

    return (
        <Stack spacing="10px" style={{ width: '100%' }}>
            <Typography style={{ fontWeight: 500, marginBottom: 8 }}>
                {intl.formatMessage(
                    { id: 'alerts.config.dialog.label.subscribers' },
                    { count: targetSubscriptionMetadata.subscriptions.length }
                )}
            </Typography>

            {targetSubscriptionMetadata.subscriptions.map(
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
