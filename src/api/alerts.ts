import pLimit from 'p-limit';
import { stringifyJSON } from 'services/stringify';
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
import { CHUNK_SIZE } from 'utils/misc-utils';

interface CreateObject {
    catalog_prefix: string;
    email: string;
}

const createNotificationSubscription = async (
    createObjects: CreateObject[]
) => {
    const limiter = pLimit(3);
    const promises = [];
    let index = 0;

    const promiseGenerator = (idx: number) => {
        return insertSupabase(
            TABLES.ALERT_SUBSCRIPTIONS,
            createObjects.slice(idx, idx + CHUNK_SIZE)
        );
    };

    while (index < createObjects.length) {
        const prom = promiseGenerator(index);
        promises.push(limiter(() => prom));
        index = index + CHUNK_SIZE;
    }

    const response = await Promise.all(promises);
    const errors = response.filter((r) => r.error);
    return errors[0] ?? response[0];
};

const deleteNotificationSubscription = async (
    prefix: string,
    emails: string[]
) => {
    const limiter = pLimit(3);
    const promises = [];
    let index = 0;

    // TODO (retry) promise generator
    const promiseGenerator = (idx: number) => {
        return supabaseClient
            .from(TABLES.ALERT_SUBSCRIPTIONS)
            .delete()
            .eq('catalog_prefix', prefix)
            .in(
                'email',
                emails
                    .slice(idx, idx + CHUNK_SIZE)
                    .flatMap((email) => stringifyJSON(email)) // To handle if quotes were includes in the email names
            );
    };

    while (index < emails.length) {
        const prom = promiseGenerator(index);
        promises.push(limiter(() => prom));
        index = index + CHUNK_SIZE;
    }

    const response = await Promise.all(promises);
    const errors = response.filter((r) => r.error);
    return errors[0] ?? response[0];
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
    sorting: SortingProps<any>[]
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
        );

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
