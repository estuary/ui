import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

export type AlertType =
    | 'auto_discover_failed'
    | 'shard_failed'
    | 'data_movement_stalled'
    | 'free_trial'
    | 'free_trial_ending'
    | 'free_trial_stalled'
    | 'missing_payment_method';

export interface AlertDetailsRecipients {
    email: string;
    full_name?: string;
}

export interface AlertDetails {
    spec_type: ShardEntityTypes;
    error?: string;
    evaluation_interval?: string;
    recipients?: AlertDetailsRecipients[];
}

export interface Alert {
    alertType: AlertType;
    firedAt: string;
    resolvedAt: string;
    alertDetails: AlertDetails;
    catalogName: string;
}

export interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
}

export type PageInfoReverse = Pick<
    PageInfo,
    'hasPreviousPage' | 'startCursor' | 'endCursor'
>;

export interface LiveSpecVariables {
    catalogName: string | undefined;
}

export interface AlertsVariables {
    active: boolean | undefined;
    prefix: string | undefined;
}

export interface PaginationVariables {
    after: string | undefined;
    before: string | undefined;
    first?: number | undefined;
    last?: number | undefined;
}

export type WithPagination<T> = T & PaginationVariables;

export type DefaultAlertingQueryResponse = {
    alerts: {
        edges: {
            node: Alert;
        }[];
        pageInfo?: PageInfoReverse;
    };
};
export interface ActiveAlertCountQueryResponse {
    liveSpecs: {
        edges: {
            cursor: string;
            node: {
                activeAlerts: {
                    alertType: Pick<Alert, 'alertType'>;
                }[];
            };
        }[];
    };
}

export type AlertHistoryForTaskQueryResponse = DefaultAlertingQueryResponse;
export type AlertingOverviewQueryResponse = AlertHistoryForTaskQueryResponse;
