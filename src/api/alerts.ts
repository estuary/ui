import {
    defaultTableFilter,
    deleteSupabase,
    handleFailure,
    handleSuccess,
    insertSupabase,
    SortingProps,
    supabaseClient,
    supabaseRetry,
    TABLES,
    updateSupabase,
} from 'services/supabase';
import { AlertSubscription, DataProcessingAlert } from 'types';

const createNotificationSubscription = (prefix: string, email: string) => {
    return insertSupabase(TABLES.ALERT_SUBSCRIPTIONS, {
        catalog_prefix: prefix,
        email,
    });
};

interface DeleteSubscriptionMatchData {
    email: string;
    catalog_prefix?: string;
    subscription_id?: string;
}

const deleteNotificationSubscription = (
    email: string,
    prefix?: string,
    subscriptionId?: string
) => {
    let matchData: DeleteSubscriptionMatchData = { email };

    if (prefix) {
        matchData = { ...matchData, catalog_prefix: prefix };
    }

    if (subscriptionId) {
        matchData = { ...matchData, subscription_id: subscriptionId };
    }

    return deleteSupabase(TABLES.ALERT_SUBSCRIPTIONS, matchData);
};

const createDataProcessingNotification = (
    catalogName: string,
    evaluationInterval: string
) => {
    return insertSupabase(TABLES.ALERT_DATA_PROCESSING, {
        catalog_name: catalogName,
        evaluation_interval: evaluationInterval,
    });
};

const updateDataProcessingNotificationInterval = (
    catalogName: string,
    evaluationInterval: string
) => {
    return updateSupabase(
        TABLES.ALERT_DATA_PROCESSING,
        { evaluation_interval: evaluationInterval },
        { catalog_name: catalogName }
    );
};

const deleteDataProcessingNotification = (catalogName: string) => {
    return deleteSupabase(TABLES.ALERT_DATA_PROCESSING, {
        catalog_name: catalogName,
    });
};

export type AlertSubscriptionQuery = Pick<
    AlertSubscription,
    'id' | 'catalog_prefix' | 'email'
>;

export type ExistingAlertSubscriptionQuery = Pick<
    AlertSubscription,
    'catalog_prefix'
>;

export type AlertSubscriptionsExtendedQuery = Pick<
    AlertSubscription,
    'id' | 'updated_at' | 'catalog_prefix' | 'email'
>;

export type DataProcessingAlertQuery = Pick<
    DataProcessingAlert,
    'catalog_name' | 'evaluation_interval'
>;

const getNotificationSubscriptionForUser = async (
    prefix: string,
    email: string
) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from<AlertSubscriptionQuery>(TABLES.ALERT_SUBSCRIPTIONS)
                .select(`id, catalog_prefix, email`)
                .eq('catalog_prefix', prefix)
                .eq('email', email),
        'getNotificationSubscriptionForUser'
    ).then(handleSuccess<AlertSubscriptionQuery[]>, handleFailure);

    return data;
};

const getNotificationSubscriptionsForTable = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[],
    objectRoles: string[]
) => {
    let queryBuilder = supabaseClient
        .from<AlertSubscriptionsExtendedQuery>(TABLES.ALERT_SUBSCRIPTIONS)
        .select(
            `    
                id,
                updated_at,
                catalog_prefix,
                email
            `,
            { count: 'exact' }
        )
        .in('catalog_prefix', objectRoles);

    queryBuilder = defaultTableFilter<AlertSubscriptionsExtendedQuery>(
        queryBuilder,
        ['catalog_prefix', 'email'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

const getNotificationSubscriptions = async (prefix?: string) => {
    let queryBuilder = supabaseClient
        .from<AlertSubscriptionsExtendedQuery>(TABLES.ALERT_SUBSCRIPTIONS)
        .select(
            `    
            id,
            updated_at,
            catalog_prefix,
            email
        `
        );

    if (prefix) {
        queryBuilder = queryBuilder.eq('catalog_prefix', prefix);
    }

    const data = await supabaseRetry(
        () => queryBuilder,
        'getNotificationSubscriptions'
    ).then(handleSuccess<AlertSubscriptionsExtendedQuery[]>, handleFailure);

    return data;
};

const getTaskNotification = async (catalogName: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from<DataProcessingAlertQuery>(TABLES.ALERT_DATA_PROCESSING)
                .select(`catalog_name, evaluation_interval`)
                .eq('catalog_name', catalogName),
        'getTaskNotification'
    ).then(handleSuccess<DataProcessingAlertQuery[]>, handleFailure);

    return data;
};

export {
    createDataProcessingNotification,
    createNotificationSubscription,
    deleteDataProcessingNotification,
    deleteNotificationSubscription,
    getNotificationSubscriptionForUser,
    getNotificationSubscriptions,
    getNotificationSubscriptionsForTable,
    getTaskNotification,
    updateDataProcessingNotificationInterval,
};
