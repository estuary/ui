import type { OptionsObject } from 'notistack';
import type { ReducedAlertSubscription } from 'src/api/types';

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
    data: ReducedAlertSubscription[]
) => {
    const processedQuery: SubscriptionDictionary = {};

    data.forEach(({ alertTypes, catalogPrefix, email, updatedAt }) => {
        if (Object.hasOwn(processedQuery, catalogPrefix)) {
            processedQuery[catalogPrefix].meta.push({
                email,
                id: crypto.randomUUID(),
                lastUpdated: updatedAt,
            });
        } else {
            processedQuery[catalogPrefix] = {
                alertTypes: alertTypes?.sort() ?? [],
                meta: [
                    {
                        email,
                        id: crypto.randomUUID(),
                        lastUpdated: updatedAt,
                    },
                ],
            };
        }
    });

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
