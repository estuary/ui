import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    insertSupabase,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import {
    Notification_EvaluationInterval,
    NotificationFullQuery,
    NotificationMessage,
    NotificationPreference,
} from 'types';

const createNotificationPreference = (
    scope: string,
    userId: string,
    email: string
) => {
    return insertSupabase(TABLES.NOTIFICATION_PREFERENCES, {
        prefix: scope,
        subscribed_by: userId,
        user_id: userId,
        verified_email: email,
    });
};

interface CreateNotificationMatchData {
    method_id: string;
    message_id: string;
    evaluation_interval?: Notification_EvaluationInterval;
    live_spec_id?: string;
}

const createNotification = (
    method_id: string,
    message_id: string,
    evaluation_interval?: Notification_EvaluationInterval,
    live_spec_id?: string
) => {
    let matchData: CreateNotificationMatchData = {
        method_id,
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

export type NotificationMessageQuery = Pick<
    NotificationMessage,
    'id' | 'detail'
>;

export type NotificationPreferenceQuery = Pick<
    NotificationPreference,
    'id' | 'prefix' | 'user_id'
>;

export type NotificationPreferencesTableQuery = Pick<
    NotificationPreference,
    'id' | 'updated_at' | 'prefix' | 'user_id' | 'verified_email'
>;

export type NotificationQuery = Pick<
    NotificationFullQuery,
    'id' | 'method_id' | 'message_id' | 'live_spec_id' | 'evaluation_interval'
>;

const getNotificationMessageByName = async (name: string) => {
    const data = await supabaseClient
        .from<NotificationMessageQuery>(TABLES.NOTIFICATION_MESSAGES)
        .select(`id, detail`)
        .eq('detail', name)
        .then(handleSuccess<NotificationMessageQuery[]>, handleFailure);

    return data;
};

const getNotificationPreferenceByPrefix = async (
    scope: string,
    userId: string
) => {
    const data = await supabaseClient
        .from<NotificationPreferenceQuery>(TABLES.NOTIFICATION_PREFERENCES)
        .select(`id, prefix, user_id`)
        .eq('prefix', scope)
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
        .from<NotificationPreferencesTableQuery>(
            TABLES.NOTIFICATION_PREFERENCES
        )
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

    queryBuilder = defaultTableFilter<NotificationPreferencesTableQuery>(
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
        .select(`id, method_id, message_id, live_spec_id, evaluation_interval`)
        .eq('method_id', preferenceId)
        .eq('message_id', messageId)
        .eq('live_spec_id', liveSpecId)
        .then(handleSuccess<NotificationQuery[]>, handleFailure);

    return data;
};

export {
    createNotification,
    createNotificationPreference,
    getNotificationMessageByName,
    getNotificationPreference,
    getNotificationPreferenceByPrefix,
    getTaskNotification,
};
