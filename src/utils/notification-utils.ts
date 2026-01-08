import type { OptionsObject } from 'notistack';
import type { AlertSubscriptionsExtendedQuery } from 'src/api/alerts';

import { isEmpty } from 'lodash';

export const snackbarSettings: OptionsObject = {
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
    },
    preventDuplicate: true,
    variant: 'info',
};

export interface UserSubscription {
    email: string;
    subscriptionId: string;
}

export interface PrefixSubscription {
    alertTypes: string[];
    userSubscriptions: UserSubscription[];
    lastUpdated: string;
}

export interface PrefixSubscriptionDictionary {
    [prefix: string]: PrefixSubscription;
}

interface SubscriptionMetadata {
    email: string;
    id: string;
    lastUpdated: Date;
}

interface SubscriptionDictionary {
    [prefix: string]: { alertTypes: string[]; meta: SubscriptionMetadata[] };
}

export const formatNotificationSubscriptionsByPrefix = (
    data: AlertSubscriptionsExtendedQuery[]
) => {
    const processedQuery: SubscriptionDictionary = {};

    data.forEach(
        ({ catalog_prefix, email, id, include_alert_types, updated_at }) => {
            if (Object.hasOwn(processedQuery, catalog_prefix)) {
                processedQuery[catalog_prefix].meta.push({
                    email,
                    id,
                    lastUpdated: updated_at,
                });
            } else {
                processedQuery[catalog_prefix] = {
                    alertTypes: include_alert_types.sort(),
                    meta: [
                        {
                            email,
                            id,
                            lastUpdated: updated_at,
                        },
                    ],
                };
            }
        }
    );

    const subscriptions: { [prefix: string]: PrefixSubscription } = {};

    if (!isEmpty(processedQuery)) {
        Object.entries(processedQuery).forEach(([prefix, config]) => {
            const updateTimestamps = config.meta.map((config) =>
                new Date(config.lastUpdated).valueOf()
            );

            const lastUpdated = new Date(
                Math.max(...updateTimestamps)
            ).toUTCString();

            subscriptions[prefix] = {
                alertTypes: config.alertTypes,
                lastUpdated,
                userSubscriptions: config.meta.map(({ email, id }) => ({
                    email,
                    subscriptionId: id,
                })),
            };
        });
    }

    return subscriptions;
};
