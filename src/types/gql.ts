import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';

export type AlertType =
    | 'autodiscoverfailed'
    | 'shardfailed'
    | 'datamovementstalled'
    | 'freetrial'
    | 'freetrialending'
    | 'freetrialstalled'
    | 'missingpaymentmethod';

export interface AlertDetails {
    spec_type: ShardEntityTypes;
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
