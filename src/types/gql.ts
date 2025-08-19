export type AlertType =
    | 'autodiscoverfailed'
    | 'shardfailed'
    | 'datamovementstalled'
    | 'freetrial'
    | 'freetrialending'
    | 'freetrialstalled'
    | 'missingpaymentmethod';

export interface Alert {
    alertType: AlertType;
    firedAt: string;
    resolvedAt: string;
    alertDetails: any;
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
