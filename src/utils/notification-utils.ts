import { isEmpty } from 'lodash';
import { OptionsObject } from 'notistack';
import { NotificationPreferenceExt } from 'types';

export const snackbarSettings: OptionsObject = {
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
    },
    preventDuplicate: true,
    variant: 'info',
};

export interface UserPreference {
    preferenceId: string;
    userId: string | null;
    email: string;
}

export interface PrefixPreference {
    userPreferences: UserPreference[];
    lastUpdated: string;
}

export interface PrefixPreferenceDictionary {
    [prefix: string]: PrefixPreference;
}

interface CondensedPreference {
    id: string;
    userId: string | null;
    email: string;
    lastUpdated: Date;
}

interface CondensedPreferenceDictionary {
    [prefix: string]: CondensedPreference[];
}

export const condenseNotificationPreferences = (
    data: NotificationPreferenceExt[]
) => {
    const processedQuery: CondensedPreferenceDictionary = {};

    data.filter((query) => query.prefix.endsWith('/')).forEach((query) => {
        if (Object.hasOwn(processedQuery, query.prefix)) {
            processedQuery[query.prefix].push({
                id: query.id,
                userId: query.user_id,
                email: query.verified_email,
                lastUpdated: query.updated_at,
            });
        } else {
            processedQuery[query.prefix] = [
                {
                    id: query.id,
                    userId: query.user_id,
                    email: query.verified_email,
                    lastUpdated: query.updated_at,
                },
            ];
        }
    });

    const preferences: { [prefix: string]: PrefixPreference } = {};

    if (!isEmpty(processedQuery)) {
        Object.entries(processedQuery).forEach(([prefix, configs]) => {
            const lastUpdated = new Date(
                Math.max.apply(configs.map((config) => config.lastUpdated))
            ).toUTCString();

            preferences[prefix] = {
                userPreferences: configs.map(({ id, userId, email }) => ({
                    preferenceId: id,
                    userId,
                    email,
                })),
                lastUpdated,
            };
        });
    }

    return preferences;
};
