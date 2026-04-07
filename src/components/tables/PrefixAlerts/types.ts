import type { Dispatch, SetStateAction } from 'react';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';

export interface RowProps {
    alertTypeDefs: AlertTypeInfo[];
    row: ReducedAlertSubscription;
}

export interface RowsProps {
    alertTypeDefs: AlertTypeInfo[];
    data: ReducedAlertSubscription[];
}

export interface TableFilterProps {
    disabled: boolean;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}
