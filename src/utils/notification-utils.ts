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
