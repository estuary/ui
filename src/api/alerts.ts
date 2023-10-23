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
    NotificationSubscription,
    NotificationSubscriptionExt,
} from 'types';

const createNotificationSubscription = (prefix: string, userId: string) => {
    return insertSupabase(TABLES.NOTIFICATION_SUBSCRIPTIONS, {
        catalog_prefix: prefix,
        user_id: userId,
    });
};

const deleteNotificationSubscription = (
    subscriptionId: string,
    userId: string
) => {
    return deleteSupabase(TABLES.NOTIFICATION_SUBSCRIPTIONS, {
        id: subscriptionId,
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

export type NotificationSubscriptionQuery = Pick<
    NotificationSubscription,
    'id' | 'catalog_prefix' | 'user_id'
>;

export type NotificationSubscriptionsTableQuery = Pick<
    NotificationSubscriptionExt,
    'id' | 'updated_at' | 'catalog_prefix' | 'user_id' | 'verified_email'
>;

export type DataProcessingNotificationQuery = Pick<
    DataProcessingNotification,
    'live_spec_id' | 'evaluation_interval'
>;

const getNotificationSubscriptionByPrefix = async (
    prefix: string,
    userId: string
) => {
    const data = await supabaseClient
        .from<NotificationSubscriptionQuery>(TABLES.NOTIFICATION_SUBSCRIPTIONS)
        .select(`id, catalog_prefix, user_id`)
        .eq('catalog_prefix', prefix)
        .eq('user_id', userId)
        .then(handleSuccess<NotificationSubscriptionQuery[]>, handleFailure);

    return data;
};

const getNotificationSubscription = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[],
    objectRoles: string[]
) => {
    let queryBuilder = supabaseClient
        .from<NotificationSubscriptionExt>(
            TABLES.NOTIFICATION_SUBSCRIPTIONS_EXT
        )
        .select(
            `    
                id,
                updated_at,
                catalog_prefix,
                user_id,
                verified_email
            `,
            { count: 'exact' }
        )
        .in('catalog_prefix', objectRoles);

    queryBuilder = defaultTableFilter<NotificationSubscriptionExt>(
        queryBuilder,
        ['catalog_prefix', 'verified_email'],
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
    createNotificationSubscription,
    deleteDataProcessingNotification,
    deleteNotificationSubscription,
    getNotificationSubscription,
    getNotificationSubscriptionByPrefix,
    getTaskNotification,
    updateDataProcessingNotificationInterval,
};
