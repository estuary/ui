import type {
    AlertTypeExpanded,
    BaseAlertSubscriptionMutationInput,
} from 'src/types/gql';

export interface AlertSubscriptionResponse
    extends BaseAlertSubscriptionMutationInput {
    id: string;
    error?: any;
    invalid?: boolean;
}

export interface AlertTypeSelectorProps {
    options: AlertTypeExpanded[];
}

export interface EmailDictionary {
    [prefix: string]: string[];
}
