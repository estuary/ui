import type { SortingProps } from 'src/services/supabase';
import type {
    DataProcessingAlert,
    AlertSubscription as LegacyAlertSubscription,
} from 'src/types';
import type {
    AlertSubscription,
    AlertSubscriptionCreateMutationInput,
    AlertSubscriptionsBy,
} from 'src/types/gql';

import pLimit from 'p-limit';
import { gql } from 'urql';

import { supabaseClient } from 'src/context/GlobalProviders';
import { stringifyJSON } from 'src/services/stringify';
import {
    defaultTableFilter,
    deleteSupabase,
    handleFailure,
    handleSuccess,
    insertSupabase,
    supabaseRetry,
    TABLES,
    updateSupabase,
} from 'src/services/supabase';
import { CHUNK_SIZE } from 'src/utils/misc-utils';

type ReducedAlertSubscription = Pick<
    AlertSubscription,
    'alertTypes' | 'catalogPrefix' | 'email'
>;

const AlertSubscriptionQuery = gql<
    ReducedAlertSubscription,
    AlertSubscriptionsBy
>`
    query AlertSubscriptions($prefix: String!) {
        alertSubscriptions(by: { prefix: $prefix }) {
            alertTypes
            catalogPrefix
            email
        }
    }
`;

const AlertSubscriptionCreateMutation = gql<
    { catalogPrefix: string; email: string },
    AlertSubscriptionCreateMutationInput
>`
    mutation CreateAlertSubscriptionMutation(
        $prefix: String!
        $email: String!
        $alertTypes: [String!]
        $detail: String
    ) {
        createAlertSubscription(
            prefix: $prefix
            email: $email
            alertTypes: $alertTypes
            detail: $detail
        ) {
            catalogPrefix
            email
        }
    }
`;

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

export type LegacyAlertSubscriptionQuery = Pick<
    LegacyAlertSubscription,
    'id' | 'catalog_prefix' | 'email'
>;

export type ExistingAlertSubscriptionQuery = Pick<
    LegacyAlertSubscription,
    'catalog_prefix'
>;

export type AlertSubscriptionsExtendedQuery = Pick<
    LegacyAlertSubscription,
    'id' | 'updated_at' | 'catalog_prefix' | 'email' | 'include_alert_types'
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
                .from(TABLES.ALERT_SUBSCRIPTIONS)
                .select(`id, catalog_prefix, email`)
                .eq('catalog_prefix', prefix)
                .eq('email', email)
                .returns<LegacyAlertSubscriptionQuery[]>(),
        'getNotificationSubscriptionForUser'
    ).then(handleSuccess<LegacyAlertSubscriptionQuery[]>, handleFailure);

    return data;
};

const getNotificationSubscriptionsForTable = (
    catalogPrefix: string,
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<AlertSubscriptionsExtendedQuery>(
        supabaseClient
            .from(TABLES.ALERT_SUBSCRIPTIONS)
            .select(
                `id, updated_at, catalog_prefix, email, include_alert_types`
            )
            .like('catalog_prefix', `${catalogPrefix}%`),
        ['catalog_prefix', 'email'],
        searchQuery,
        sorting,
        pagination
    );
};

const getNotificationSubscriptions = async (prefix?: string) => {
    const data = await supabaseRetry(() => {
        let queryBuilder = supabaseClient
            .from(TABLES.ALERT_SUBSCRIPTIONS)
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

        return queryBuilder.returns<AlertSubscriptionsExtendedQuery[]>();
    }, 'getNotificationSubscriptions').then(
        handleSuccess<AlertSubscriptionsExtendedQuery[]>,
        handleFailure
    );

    return data;
};

const getTaskNotification = async (catalogName: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.ALERT_DATA_PROCESSING)
                .select(`catalog_name, evaluation_interval`)
                .eq('catalog_name', catalogName)
                .returns<DataProcessingAlertQuery[]>(),
        'getTaskNotification'
    ).then(handleSuccess<DataProcessingAlertQuery[]>, handleFailure);

    return data;
};

export {
    AlertSubscriptionCreateMutation,
    AlertSubscriptionQuery,
    createDataProcessingNotification,
    deleteDataProcessingNotification,
    deleteNotificationSubscription,
    getNotificationSubscriptionForUser,
    getNotificationSubscriptions,
    getNotificationSubscriptionsForTable,
    getTaskNotification,
    updateDataProcessingNotificationInterval,
};
