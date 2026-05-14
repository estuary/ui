import type { TableCellProps } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';
import type { BaseAlertSubscriptionMutationInput } from 'src/types/gql';

export interface AlertSubscriptionDialogProps extends PrefixFieldProps {
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

// TODO: Remove and replace type with instance of SubscriptionDependentProps.
export interface AlertTypeFieldProps {
    subscription: MutableAlertSubscription;
}

export interface AlertTypeSelectorProps extends AlertTypeFieldProps {
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

export interface EmailListFieldProps extends SubscriptionDependentProps {
    staticEmail?: string;
}

export interface MutableAlertSubscription extends ReducedAlertSubscription {
    id: string;
    viewing: boolean;
    deleted?: boolean;
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
    subscription: MutableAlertSubscription;
    expanded?: boolean;
}

export interface SubscriptionDependentProps {
    subscription: MutableAlertSubscription;
}

export interface SubscriptionMetadata {
    settings: GlobalSettingDictionary;
    subscriptions: MutableAlertSubscription[];
}

export interface SubscriptionMetadataDictionary {
    [prefix: string]: SubscriptionMetadata;
}
