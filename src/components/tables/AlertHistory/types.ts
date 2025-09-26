import type { TablePrefixes } from 'src/stores/Tables/hooks';
import type { TableColumns } from 'src/types';
import type { Alert, ResolvedAlertsForTaskQuery } from 'src/types/gql';

export interface AlertHistoryTableProps {
    tablePrefix: TablePrefixes.alertHistoryForEntity;
}

export interface AlertTruncationMessageProps {
    alertCount: number;
}

export interface RowsProps {
    columns: TableColumns[];
    data: ResolvedAlertsForTaskQuery['alerts']['edges'];
}

export interface RowProps {
    columns: TableColumns[];
    row: Alert;
    hideEntityName?: boolean;
}

export interface DetailsPaneProps {
    foo: any;
}
