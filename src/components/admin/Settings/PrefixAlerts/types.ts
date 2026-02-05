export interface AlertSubscriptionKey {
    catalogPrefix: string;
    email: string;
}

export interface AlertSubscriptionResponse extends AlertSubscriptionKey {
    id: string;
    error?: any;
    invalid?: boolean;
}

export interface EmailDictionary {
    [prefix: string]: string[];
}
