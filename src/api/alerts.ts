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
import { AlertSubscription, DataProcessingAlert } from 'types';

const createNotificationSubscription = (prefix: string, email: string) => {
    return insertSupabase(TABLES.ALERT_SUBSCRIPTIONS, {
        catalog_prefix: prefix,
        email,
    });
};

const deleteNotificationSubscription = (
    subscriptionId: string,
    email: string
) => {
    return deleteSupabase(TABLES.ALERT_SUBSCRIPTIONS, {
        id: subscriptionId,
        email,
    });
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

export type AlertSubscriptionsTableQuery = Pick<
    AlertSubscription,
    'id' | 'updated_at' | 'catalog_prefix' | 'email'
>;

export type DataProcessingAlertQuery = Pick<
    DataProcessingAlert,
    'catalog_name' | 'evaluation_interval'
>;

const getNotificationSubscriptionByPrefix = async (
    prefix: string,
    email: string
) => {
    const data = await supabaseClient
        .from<AlertSubscriptionQuery>(TABLES.ALERT_SUBSCRIPTIONS)
        .select(`id, catalog_prefix, email`)
        .eq('catalog_prefix', prefix)
        .eq('email', email)
        .then(handleSuccess<AlertSubscriptionQuery[]>, handleFailure);

    return data;
};

const getNotificationSubscription = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[],
    objectRoles: string[]
) => {
    let queryBuilder = supabaseClient
        .from<AlertSubscriptionsTableQuery>(TABLES.ALERT_SUBSCRIPTIONS)
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

    queryBuilder = defaultTableFilter<AlertSubscriptionsTableQuery>(
        queryBuilder,
        ['catalog_prefix', 'email'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

const getTaskNotification = async (catalogName: string) => {
    const data = await supabaseClient
        .from<DataProcessingAlertQuery>(TABLES.ALERT_DATA_PROCESSING)
        .select(`catalog_name, evaluation_interval`)
        .eq('catalog_name', catalogName)
        .then(handleSuccess<DataProcessingAlertQuery[]>, handleFailure);

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
