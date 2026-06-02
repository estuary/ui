import type { OptionsObject } from 'notistack';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { SubscriptionMetadataDictionary } from 'src/components/admin/Settings/PrefixAlerts/types';

export const snackbarSettings: OptionsObject = {
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
    },
    preventDuplicate: true,
    variant: 'info',
};

export const bundleSubscriptionsByPrefix = (
    data: ReducedAlertSubscription[]
) => {
    const subscriptionMetadata: SubscriptionMetadataDictionary = {};

    data.forEach((query) => {
        const { catalogPrefix } = query;

        if (Object.hasOwn(subscriptionMetadata, catalogPrefix)) {
            subscriptionMetadata[catalogPrefix].subscriptions.push({
                ...query,
                id: crypto.randomUUID(),
                viewing: false,
            });
        } else {
            subscriptionMetadata[catalogPrefix] = {
                settings: {},
                subscriptions: [
                    { ...query, id: crypto.randomUUID(), viewing: false },
                ],
            };
        }
    });

    return subscriptionMetadata;
};

export const translateUnconventionalTimeFormat = (
    value: string | undefined
) => {
    switch (value) {
        case '1h':
            return '01:00:00';
        case '2h':
            return '02:00:00';
        case '4h':
            return '04:00:00';
        case '8h':
            return '08:00:00';
        case '12h':
            return '12:00:00';
        case '24h':
            return '24:00:00';
        case '1d':
            return '24:00:00';
        case '2d':
            return '2 days';
        case '3d':
            return '3 days';
        case '7d':
            return '7 days';
        default:
            return 'none';
    }
};
