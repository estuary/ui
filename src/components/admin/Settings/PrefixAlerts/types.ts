import type { TableCellProps } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import type { ReducedAlertSubscription } from 'src/api/types';
import type {
    BaseAlertSubscriptionMutationInput,
    ExpandedAlertTypeDef,
} from 'src/types/gql';
import type { UseQueryExecute } from 'urql';

export interface AlertSubscriptionDialogProps
    extends AlertTypeFieldProps,
        EmailListFieldProps,
        PrefixFieldProps {
    descriptionId: string;
    executeQuery: UseQueryExecute;
    headerId: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    enableDeletion?: boolean;
}

export interface AlertSubscriptionResponse
    extends BaseAlertSubscriptionMutationInput {
    id: string;
    error?: any;
    invalid?: boolean;
}

export interface AlertTypeFieldProps {
    existingAlertTypes?: ReducedAlertSubscription['alertTypes'];
}

export interface AlertTypeSelectorProps {
    options: ExpandedAlertTypeDef[];
}

export interface BaseButtonProps {
    executeQuery: UseQueryExecute;
}

export interface DialogActionProps {
    closeDialog: () => void;
}

export interface EditButtonProps extends BaseButtonProps, TableCellProps {
    alertTypes: ReducedAlertSubscription['alertTypes'];
    email: string;
    prefix: string;
}

export interface EmailDictionary {
    [prefix: string]: string[];
}

export interface EmailListFieldProps {
    staticEmail?: string;
}

export interface PrefixFieldProps {
    staticPrefix?: string;
}
