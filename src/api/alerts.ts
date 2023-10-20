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
    DataProcessingNotification,
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
    live_spec_id: string;
    evaluation_interval?: string;
}

const createDataProcessingNotification = (
    liveSpecId: string,
    evaluation_interval?: string
) => {
    let matchData: CreateNotificationMatchData = {
        live_spec_id: liveSpecId,
    };

    if (evaluation_interval) {
        matchData = { ...matchData, evaluation_interval };
    }

    return insertSupabase(TABLES.DATA_PROCESSING_NOTIFICATIONS, matchData);
};

const updateDataProcessingNotificationInterval = (
    liveSpecId: string,
    evaluationInterval: string
) => {
    return updateSupabase(
        TABLES.DATA_PROCESSING_NOTIFICATIONS,
        { evaluation_interval: evaluationInterval },
        { live_spec_id: liveSpecId }
    );
};

const deleteDataProcessingNotification = (liveSpecId: string) => {
    return deleteSupabase(TABLES.DATA_PROCESSING_NOTIFICATIONS, {
        live_spec_id: liveSpecId,
    });
};

export type NotificationPreferenceQuery = Pick<
    NotificationPreference,
    'id' | 'prefix' | 'user_id'
>;

export type NotificationPreferencesTableQuery = Pick<
    NotificationPreferenceExt,
    'id' | 'updated_at' | 'prefix' | 'user_id' | 'verified_email'
>;

export type DataProcessingNotificationQuery = Pick<
    DataProcessingNotification,
    'live_spec_id' | 'evaluation_interval'
>;

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

const getTaskNotification = async (liveSpecId: string) => {
    const data = await supabaseClient
        .from<DataProcessingNotificationQuery>(
            TABLES.DATA_PROCESSING_NOTIFICATIONS
        )
        .select(`live_spec_id, evaluation_interval`)
        .eq('live_spec_id', liveSpecId)
        .then(handleSuccess<DataProcessingNotificationQuery[]>, handleFailure);

    return data;
};

export {
    createDataProcessingNotification,
    createNotificationPreference,
    deleteDataProcessingNotification,
    deleteNotificationPreference,
    getNotificationPreference,
    getNotificationPreferenceByPrefix,
    getTaskNotification,
    updateDataProcessingNotificationInterval,
};
