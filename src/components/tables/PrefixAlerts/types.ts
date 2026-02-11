import type { ReducedAlertSubscription } from 'src/api/types';

export interface RowProps {
    row: ReducedAlertSubscription;
}

export interface RowsProps {
    data: ReducedAlertSubscription[];
}
