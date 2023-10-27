import { isEmpty } from 'lodash';
import { OptionsObject } from 'notistack';
import { NotificationSubscriptionExt } from 'types';

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
    userId: string | null;
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
    userId: string | null;
    email: string;
    lastUpdated: Date;
}

interface SubscriptionDictionary {
    [prefix: string]: SubscriptionMetadata[];
}

export const formatNotificationSubscriptionsByPrefix = (
    data: NotificationSubscriptionExt[]
) => {
    const processedQuery: SubscriptionDictionary = {};

    data.forEach((query) => {
        if (Object.hasOwn(processedQuery, query.catalog_prefix)) {
            processedQuery[query.catalog_prefix].push({
                id: query.id,
                userId: query.user_id,
                email: query.verified_email,
                lastUpdated: query.updated_at,
            });
        } else {
            processedQuery[query.catalog_prefix] = [
                {
                    id: query.id,
                    userId: query.user_id,
                    email: query.verified_email,
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
                userSubscriptions: configs.map(({ id, userId, email }) => ({
                    subscriptionId: id,
                    userId,
                    email,
                })),
                lastUpdated,
            };
        });
    }

    return subscriptions;
};
