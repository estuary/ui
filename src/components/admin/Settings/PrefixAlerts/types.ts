import type {
    AlertTypeDef,
    BaseAlertSubscriptionMutationInput,
} from 'src/types/gql';
import type { UseQueryExecute } from 'urql';

export interface AlertGenerateButtonProps {
    executeQuery: UseQueryExecute;
    fetching: boolean;
}

export interface AlertSubscriptionResponse
    extends BaseAlertSubscriptionMutationInput {
    id: string;
    error?: any;
    invalid?: boolean;
}

export interface AlertTypeSelectorProps {
    options: AlertTypeDef[];
}

export interface EmailDictionary {
    [prefix: string]: string[];
}
