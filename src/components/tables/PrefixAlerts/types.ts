import type { ReducedAlertSubscription } from 'src/api/types';
import type { UseQueryExecute } from 'urql';

export interface RowProps {
    executeQuery: UseQueryExecute;
    row: ReducedAlertSubscription;
}

export interface RowsProps {
    data: ReducedAlertSubscription[];
    executeQuery: UseQueryExecute;
}
