import type { TablePrefixes } from 'src/stores/Tables/hooks';
import type { TableColumns } from 'src/types';
import type { Alert, ResolvedAlertsForTaskQuery } from 'src/types/gql';

export interface AlertHistoryTableProps {
    active: boolean;
    tablePrefix:
        | TablePrefixes.alertHistoryForEntity
        | TablePrefixes.alertsForEntity;
    disableFooter?: boolean;
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
    hideResolvedAt?: boolean;
}

export interface DetailsPaneProps {
    foo: any;
}
