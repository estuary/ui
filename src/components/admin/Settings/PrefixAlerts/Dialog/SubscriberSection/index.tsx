import type { SubscriptionMetadata } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SubscriberInfo from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo';
import AddButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/AddButton';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { hasOwnProperty } from 'src/utils/misc-utils';

const SubscriberSection = () => {
    const intl = useIntl();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );

    const targetSubscriptionMetadata: SubscriptionMetadata = useMemo(
        () =>
            hasOwnProperty(mutableSubscriptionMetadata, catalogPrefix)
                ? mutableSubscriptionMetadata[catalogPrefix]
                : { settings: {}, subscriptions: [] },
        [catalogPrefix, mutableSubscriptionMetadata]
    );

    return (
        <Stack spacing="10px" style={{ width: '100%' }}>
            <Stack
                direction="row"
                style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography style={{ fontWeight: 500 }}>
                    {intl.formatMessage(
                        { id: 'alerts.config.dialog.label.subscribers' },
                        {
                            count: targetSubscriptionMetadata.subscriptions
                                .length,
                        }
                    )}
                </Typography>

                <AddButton />
            </Stack>

            {targetSubscriptionMetadata.subscriptions
                .filter(({ deleted }) => !deleted)
                .map((subscription, index) => (
                    <SubscriberInfo
                        subscription={subscription}
                        key={`${subscription.catalogPrefix}-${subscription.email}-${index}`}
                    />
                ))}
        </Stack>
    );
};

export default SubscriberSection;
