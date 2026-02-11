import type { ReducedAlertSubscriptionQueryResponse } from 'src/api/types';
import type { SortingProps } from 'src/services/supabase';
import type {
    DataProcessingAlert,
    AlertSubscription as LegacyAlertSubscription,
} from 'src/types';
import type {
    AlertSubscriptionCreateMutationInput,
    AlertSubscriptionsBy,
    AlertTypeQueryResponse,
} from 'src/types/gql';

import { gql } from 'urql';

import { supabaseClient } from 'src/context/GlobalProviders';
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

const AlertSubscriptionQuery = gql<
    ReducedAlertSubscriptionQueryResponse,
    AlertSubscriptionsBy
>`
    query AlertSubscriptions($prefix: String!) {
        alertSubscriptions(by: { prefix: $prefix }) {
            alertTypes
            catalogPrefix
            email
            updatedAt
        }
    }
`;

const AlertTypeQuery = gql<AlertTypeQueryResponse>`
    query {
        __type(name: "AlertType") {
            enumValues {
                description
                name
            }
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

const AlertSubscriptionDeleteMutation = gql<
    { catalogPrefix: string; email: string },
    AlertSubscriptionCreateMutationInput
>`
    mutation DeleteAlertSubscriptionMutation(
        $prefix: String!
        $email: String!
    ) {
        deleteAlertSubscription(prefix: $prefix, email: $email) {
            catalogPrefix
            email
        }
    }
`;

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
    AlertSubscriptionDeleteMutation,
    AlertSubscriptionQuery,
    AlertTypeQuery,
    createDataProcessingNotification,
    deleteDataProcessingNotification,
    getNotificationSubscriptionForUser,
    getNotificationSubscriptionsForTable,
    getTaskNotification,
    updateDataProcessingNotificationInterval,
};
