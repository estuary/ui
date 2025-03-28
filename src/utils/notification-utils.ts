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
    subscriptionId: string;
    email: string;
}

export interface PrefixSubscription {
    userSubscriptions: UserSubscription[];
    lastUpdated: string;
}

export interface PrefixSubscriptionDictionary {
    [prefix: string]: PrefixSubscription;
}

interface SubscriptionMetadata {
    id: string;
    email: string;
    lastUpdated: Date;
}

interface SubscriptionDictionary {
    [prefix: string]: SubscriptionMetadata[];
}

export const formatNotificationSubscriptionsByPrefix = (
    data: AlertSubscriptionsExtendedQuery[]
) => {
    const processedQuery: SubscriptionDictionary = {};

    data.forEach((query) => {
        if (Object.hasOwn(processedQuery, query.catalog_prefix)) {
            processedQuery[query.catalog_prefix].push({
                id: query.id,
                email: query.email,
                lastUpdated: query.updated_at,
            });
        } else {
            processedQuery[query.catalog_prefix] = [
                {
                    id: query.id,
                    email: query.email,
                    lastUpdated: query.updated_at,
                },
            ];
        }
    });

    const subscriptions: { [prefix: string]: PrefixSubscription } = {};

    if (!isEmpty(processedQuery)) {
        Object.entries(processedQuery).forEach(([prefix, configs]) => {
            const updateTimestamps = configs.map((config) =>
                new Date(config.lastUpdated).valueOf()
            );

            const lastUpdated = new Date(
                Math.max(...updateTimestamps)
            ).toUTCString();

            subscriptions[prefix] = {
                userSubscriptions: configs.map(({ id, email }) => ({
                    subscriptionId: id,
                    email,
                })),
                lastUpdated,
            };
        });
    }

    return subscriptions;
};
