import type { Dispatch, SetStateAction } from 'react';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { UseQueryExecute } from 'urql';

export interface RowProps {
    executeQuery: UseQueryExecute;
    height: number;
    row: ReducedAlertSubscription;
}

export interface RowsProps {
    data: ReducedAlertSubscription[];
    executeQuery: UseQueryExecute;
}

export interface TableFilterProps {
    disabled: boolean;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}
