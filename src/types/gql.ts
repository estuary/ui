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
    arguments: any;
    catalogName: string;
}

export interface AlertsVariables {
    prefixes: string[] | undefined;
}

export interface AlertHistoryQueryResponse {
    alerts: Alert[];
}

export interface LatestAlertQueryResponse {
    alerts: Pick<Alert, 'alertType'>[];
}
