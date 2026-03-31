import type { Dispatch, SetStateAction } from 'react';
import type { ReducedAlertSubscription } from 'src/api/types';
import type { AlertTypeDef } from 'src/types/gql';

export interface RowProps {
    alertTypeDefs: AlertTypeDef[];
    row: ReducedAlertSubscription;
}

export interface RowsProps {
    alertTypeDefs: AlertTypeDef[];
    data: ReducedAlertSubscription[];
}

export interface TableFilterProps {
    disabled: boolean;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}
