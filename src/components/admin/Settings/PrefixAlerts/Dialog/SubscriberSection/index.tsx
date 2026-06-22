import type { SubscriptionMetadata } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useEffect, useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AddButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/AddButton';
import SubscriberInfo from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo';
import SummaryEmpty from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/SubscriberInfo/SummaryEmpty';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useGetAlertTypes } from 'src/context/AlertType';

const SubscriberSection = () => {
    const intl = useIntl();

    const [{ fetching, data, error }] = useGetAlertTypes();

    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );
    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    const initializeAlertTypeOptions = useAlertSubscriptionsStore(
        (state) => state.initializeAlertTypeOptions
    );

    const targetSubscriptionMetadata: SubscriptionMetadata = useMemo(
        () => ({
            ...mutableSubscriptionMetadata,
            subscriptions: mutableSubscriptionMetadata.subscriptions.filter(
                ({ deleted }) => !deleted
            ),
        }),
        [mutableSubscriptionMetadata]
    );

    useEffect(() => {
        if (error) {
            setServerError([error]);
        }
    }, [error, setServerError]);

    useEffect(() => {
        initializeAlertTypeOptions(data?.alertTypes ?? [], fetching);
    }, [data, fetching, initializeAlertTypeOptions]);

    return (
        <Stack spacing="10px" style={{ width: '100%' }}>
            <Stack
                direction="row"
                style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography style={{ fontSize: 16, fontWeight: 300 }}>
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

            {targetSubscriptionMetadata.subscriptions.length > 0 ? (
                targetSubscriptionMetadata.subscriptions.map(
                    (subscription, index) => (
                        <SubscriberInfo
                            subscription={subscription}
                            key={`${subscription.catalogPrefix}-${subscription.email}-${index}`}
                        />
                    )
                )
            ) : (
                <SummaryEmpty />
            )}
        </Stack>
    );
};

export default SubscriberSection;
