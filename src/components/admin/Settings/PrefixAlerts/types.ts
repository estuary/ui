import type { TableCellProps } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';
import type { Schema } from 'src/types';
import type { BaseAlertSubscriptionMutationInput } from 'src/types/gql';
import type { AlertConfigKeys } from 'src/utils/notification-utils';

export interface AlertConfigResponse extends AlertMetadataErrorResponse {
    prefix: string;
}

interface AlertMetadataErrorResponse {
    error?: any;
    invalid?: boolean;
}

export interface AlertSubscriptionDialogProps extends PrefixFieldProps {
    descriptionId: string;
    headerId: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface AlertSubscriptionResponse
    extends AlertMetadataErrorResponse,
        BaseAlertSubscriptionMutationInput {
    id: string;
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

interface GlobalSettingConfig<T> {
    condition: T;
    autoDisable?: boolean;
    enabled?: boolean;
}

export interface GlobalSettingProps<T> {
    config: GlobalSettingConfig<T> | undefined;
    loading: boolean;
    prefix: string;
    targetSetting: AlertConfigKeys;
}

export interface MutableAlertSubscription extends ReducedAlertSubscription {
    id: string;
    viewing: boolean;
    deleted?: boolean;
    emailErrorsExist?: boolean;
}

export interface PrefixFieldProps {
    staticPrefix?: string;
}

export interface SubscriberAccordionProps {
    subscription: MutableAlertSubscription;
    expanded?: boolean;
}

export interface SubscriberAccordionSummaryProps
    extends SubscriberAccordionProps {
    duplicateSubscriptionEmails: string[];
}

export interface SubscriptionDependentProps {
    subscription: MutableAlertSubscription;
}

export interface SubscriptionMetadata {
    settings: Schema;
    subscriptions: MutableAlertSubscription[];
}

export interface SubscriptionMetadataDictionary {
    [prefix: string]: SubscriptionMetadata;
}
