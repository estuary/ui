import type { Dispatch, SetStateAction } from 'react';
import type {
    AlertTypeDef,
    BaseAlertSubscriptionMutationInput,
} from 'src/types/gql';
import type { UseQueryExecute } from 'urql';

export interface AlertSubscriptionDialogProps {
    executeQuery: UseQueryExecute;
    headerId: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    staticPrefix?: string;
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

export interface BaseButtonProps {
    executeQuery: UseQueryExecute;
}

export interface EditButtonProps extends BaseButtonProps {
    email: string;
    prefix: string;
}

export interface EmailDictionary {
    [prefix: string]: string[];
}
