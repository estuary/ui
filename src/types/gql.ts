import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

export type AlertType =
    | 'auto_discover_failed'
    | 'shard_failed'
    | 'data_movement_stalled'
    | 'free_trial'
    | 'free_trial_ending'
    | 'free_trial_stalled'
    | 'missing_payment_method';

export interface AlertDetails {
    spec_type: ShardEntityTypes;
    error?: string;
    evaluation_interval?: string;
    recipients?: string[];
}

export interface Alert {
    alertType: AlertType;
    firedAt: string;
    resolvedAt: string;
    alertDetails: AlertDetails;
    catalogName: string;
}

export interface AlertsVariables {
    prefixes: string[] | undefined;
}

export type ActiveAlertsQueryResponse = AlertHistoryQueryResponse;
export interface AlertHistoryQueryResponse {
    alerts: Alert[];
}

export interface EntityHistoryQueryResponse {
    capture: AlertHistoryQueryResponse;
    materialization: AlertHistoryQueryResponse;
}

export interface LatestAlertQueryResponse {
    alerts: Pick<Alert, 'alertType'>[];
}
