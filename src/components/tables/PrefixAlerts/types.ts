import type { Dispatch, SetStateAction } from 'react';
import type { SubscriptionMetadata } from 'src/components/admin/Settings/PrefixAlerts/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';

export interface RowProps {
    alertTypeDefs: AlertTypeInfo[];
    row: SubscriptionMetadata;
}

export interface RowsProps {
    alertTypeDefs: AlertTypeInfo[];
    data: SubscriptionMetadata[];
}

export interface TableFilterProps {
    disabled: boolean;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}
