import type { TableCellProps } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';
import type { BaseAlertSubscriptionMutationInput } from 'src/types/gql';

export interface AlertSubscriptionDialogProps
    extends AlertTypeFieldProps,
        EmailListFieldProps,
        PrefixFieldProps {
    descriptionId: string;
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
    options: AlertTypeInfo[];
}

export interface DialogActionProps {
    closeDialog: () => void;
}

export interface EditButtonProps extends TableCellProps {
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
