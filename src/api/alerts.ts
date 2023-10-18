import {
    defaultTableFilter,
    deleteSupabase,
    handleFailure,
    handleSuccess,
    insertSupabase,
    SortingProps,
    supabaseClient,
    TABLES,
    updateSupabase,
} from 'services/supabase';
import {
    NotificationFullQuery,
    NotificationMessage,
    NotificationPreference,
    NotificationPreferenceExt,
} from 'types';

const createNotificationPreference = (prefix: string, userId: string) => {
    return insertSupabase(TABLES.NOTIFICATION_PREFERENCES, {
        prefix,
        subscribed_by: userId,
        user_id: userId,
    });
};

const deleteNotificationPreference = (preferenceId: string, userId: string) => {
    return deleteSupabase(TABLES.NOTIFICATION_PREFERENCES, {
        id: preferenceId,
        user_id: userId,
    });
};

interface CreateNotificationMatchData {
    preference_id: string;
    message_id: string;
    evaluation_interval?: string;
    live_spec_id?: string;
}

const createNotification = (
    preference_id: string,
    message_id: string,
    evaluation_interval?: string,
    live_spec_id?: string
) => {
    let matchData: CreateNotificationMatchData = {
        preference_id,
        message_id,
    };

    if (evaluation_interval) {
        matchData = { ...matchData, evaluation_interval };
    }

    if (live_spec_id) {
        matchData = { ...matchData, live_spec_id };
    }

    return insertSupabase(TABLES.NOTIFICATIONS, matchData);
};

const updateNotificationInterval = (
    notificationId: string,
    evaluationInterval: string
) => {
    return updateSupabase(
        TABLES.NOTIFICATIONS,
        { evaluation_interval: evaluationInterval },
        { id: notificationId }
    );
};

const deleteNotification = (notificationId: string) => {
    return deleteSupabase(TABLES.NOTIFICATIONS, {
        id: notificationId,
    });
};

export type NotificationMessageQuery = Pick<
    NotificationMessage,
    'id' | 'detail'
>;

export type NotificationPreferenceQuery = Pick<
    NotificationPreference,
    'id' | 'prefix' | 'user_id'
>;

export type NotificationPreferencesTableQuery = Pick<
    NotificationPreferenceExt,
    'id' | 'updated_at' | 'prefix' | 'user_id' | 'verified_email'
>;

export type NotificationQuery = Pick<
    NotificationFullQuery,
    | 'id'
    | 'preference_id'
    | 'message_id'
    | 'live_spec_id'
    | 'evaluation_interval'
>;

interface NotificationMessageOptions {
    value: string;
    column: keyof NotificationMessageQuery;
}

const getNotificationMessage = async ({
    value,
    column,
}: NotificationMessageOptions) => {
    const data = await supabaseClient
        .from<NotificationMessageQuery>(TABLES.NOTIFICATION_MESSAGES)
        .select(`id, detail`)
        .eq(column, value)
        .then(handleSuccess<NotificationMessageQuery[]>, handleFailure);

    return data;
};

const getNotificationPreferenceByPrefix = async (
    prefix: string,
    userId: string
) => {
    const data = await supabaseClient
        .from<NotificationPreferenceQuery>(TABLES.NOTIFICATION_PREFERENCES)
        .select(`id, prefix, user_id`)
        .eq('prefix', prefix)
        .eq('user_id', userId)
        .then(handleSuccess<NotificationPreferenceQuery[]>, handleFailure);

    return data;
};

const getNotificationPreference = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<NotificationPreferenceExt>(TABLES.NOTIFICATION_PREFERENCES_EXT)
        .select(
            `    
                id,
                updated_at,
                prefix,
                user_id,
                verified_email
            `,
            { count: 'exact' }
        );

    queryBuilder = defaultTableFilter<NotificationPreferenceExt>(
        queryBuilder,
        ['prefix', 'verified_email'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

const getTaskNotification = async (
    preferenceId: string,
    messageId: string,
    liveSpecId: string
) => {
    const data = await supabaseClient
        .from<NotificationQuery>(TABLES.NOTIFICATIONS)
        .select(
            `id, preference_id, message_id, live_spec_id, evaluation_interval`
        )
        .eq('preference_id', preferenceId)
        .eq('message_id', messageId)
        .eq('live_spec_id', liveSpecId)
        .then(handleSuccess<NotificationQuery[]>, handleFailure);

    return data;
};

export {
    createNotification,
    createNotificationPreference,
    deleteNotification,
    deleteNotificationPreference,
    getNotificationMessage,
    getNotificationPreference,
    getNotificationPreferenceByPrefix,
    getTaskNotification,
    updateNotificationInterval,
};
