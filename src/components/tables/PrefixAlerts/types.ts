import type { Dispatch, SetStateAction } from 'react';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { AlertTypeDef } from 'src/types/gql';
import type { UseQueryExecute } from 'urql';

export interface RowProps {
    alertTypeDefs: AlertTypeDef[];
    executeQuery: UseQueryExecute;
    row: ReducedAlertSubscription;
}

export interface RowsProps {
    alertTypeDefs: AlertTypeDef[];
    data: ReducedAlertSubscription[];
    executeQuery: UseQueryExecute;
}

export interface TableFilterProps {
    disabled: boolean;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}
