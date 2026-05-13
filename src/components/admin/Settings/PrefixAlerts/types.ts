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
    subscription?: ReducedAlertSubscription;
}

export interface AlertTypeSelectorProps {
    subscription?: ReducedAlertSubscription;
    options: AlertTypeInfo[];
}

export interface DialogActionProps {
    closeDialog: () => void;
}

export interface EditButtonProps extends TableCellProps {
    prefix: string;
    subscriptionMetadata: SubscriptionMetadata;
}

export interface EmailDictionary {
    [prefix: string]: string[];
}

export interface EmailListFieldProps {
    staticEmail?: string;
}

interface GlobalSetting {
    [property: string]: boolean | number | string;
}

interface GlobalSettingDictionary {
    [alertType: string]: GlobalSetting;
}

export interface PrefixFieldProps {
    staticPrefix?: string;
}

export interface SubscriberAccordionProps {
    subscription: ReducedAlertSubscription;
    expanded?: boolean;
}

export interface SubscriptionMetadata {
    settings: GlobalSettingDictionary;
    subscriptions: ReducedAlertSubscription[];
}

export interface SubscriptionMetadataDictionary {
    [prefix: string]: SubscriptionMetadata;
}
