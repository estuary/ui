import type { OptionsObject } from 'notistack';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { SubscriptionMetadataDictionary } from 'src/components/admin/Settings/PrefixAlerts/types';

export enum AlertConfigKeys {
    DATA_MOVEMENT_STALLED = 'dataMovementStalled',
}

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

export const fromUnconventionalTimeFormat = (value: string | undefined) => {
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
        case '1day':
            return '24:00:00';
        case '2days':
            return '2 days';
        case '3days':
            return '3 days';
        case '7days':
            return '7 days';
        default:
            return 'none';
    }
};

export const toUnconventionalTimeFormat = (value: string | undefined) => {
    switch (value) {
        case '01:00:00':
            return '1h';
        case '02:00:00':
            return '2h';
        case '04:00:00':
            return '4h';
        case '08:00:00':
            return '8h';
        case '12:00:00':
            return '12h';
        case '24:00:00':
            return '24h';
        case '2 days':
            return '2days';
        case '3 days':
            return '3days';
        case '7 days':
            return '7days';
        default:
            return 'none';
    }
};
