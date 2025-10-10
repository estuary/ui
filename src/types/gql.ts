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

export interface AlertsVariables {
    prefix: string | undefined;
}

export type DefaultAlertingQueryResponse = {
    alerts: {
        edges: {
            node: Alert;
        }[];
        pageInfo?: PageInfoReverse;
    };
};
export interface ActiveAlertCountQueryResponse {
    alerts: {
        edges: {
            cursor: string;
        }[];
    };
}

export type AlertingOverviewQueryResponse = AlertHistoryQueryResponse;
export type ActiveAlertsForTaskQueryResponse = AlertHistoryQueryResponse;
export type AlertHistoryQueryResponse = DefaultAlertingQueryResponse;
export type ResolvedAlertsForTaskQuery = DefaultAlertingQueryResponse;
