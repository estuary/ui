import type { SubscriptionMetadata } from 'src/components/admin/Settings/PrefixAlerts/types';

import { useEffect, useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SubscriberInfo from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberInfo';
import AddButton from 'src/components/admin/Settings/PrefixAlerts/Dialog/SubscriberSection/AddButton';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useGetAlertTypes } from 'src/context/AlertType';
import { hasOwnProperty } from 'src/utils/misc-utils';

const SubscriberSection = () => {
    const intl = useIntl();

    const [{ fetching, data, error }] = useGetAlertTypes();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );
    const setServerError = useAlertSubscriptionsStore(
        (state) => state.setSaveErrors
    );

    const initializeAlertTypeOptions = useAlertSubscriptionsStore(
        (state) => state.initializeAlertTypeOptions
    );

    const targetSubscriptionMetadata: SubscriptionMetadata = useMemo(() => {
        if (hasOwnProperty(mutableSubscriptionMetadata, catalogPrefix)) {
            return {
                ...mutableSubscriptionMetadata[catalogPrefix],
                subscriptions: mutableSubscriptionMetadata[
                    catalogPrefix
                ].subscriptions.filter(({ deleted }) => !deleted),
            };
        }
        return { settings: {}, subscriptions: [] };
    }, [catalogPrefix, mutableSubscriptionMetadata]);

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

            {targetSubscriptionMetadata.subscriptions.map(
                (subscription, index) => (
                    <SubscriberInfo
                        subscription={subscription}
                        key={`${subscription.catalogPrefix}-${subscription.email}-${index}`}
                    />
                )
            )}
        </Stack>
    );
};

export default SubscriberSection;
