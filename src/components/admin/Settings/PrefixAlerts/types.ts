export interface AlertSubscriptionKeys {
    catalogPrefix: string;
    email: string;
}

export interface AlertSubscriptionResponse extends AlertSubscriptionKeys {
    id: string;
    error?: any;
    invalid?: boolean;
}

export interface EmailDictionary {
    [prefix: string]: string[];
}
