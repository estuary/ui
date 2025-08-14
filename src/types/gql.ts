export type AlertType = any;
export interface Alert {
    alertType: AlertType;
    firedAt: string;
    resolvedAt: string;
    arguments: any;
    catalogName: string;
}

export interface AlertHistoryVariables {
    prefixes: string[];
}

export interface AlertHistoryQuery {
    alerts: Alert[];
}
