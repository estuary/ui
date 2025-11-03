import type { TablePrefixes } from 'src/stores/Tables/hooks';
import type { TableColumns } from 'src/types';
import type { Alert, AlertHistoryForTaskQueryResponse } from 'src/types/gql';

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
    data: AlertHistoryForTaskQueryResponse['alerts']['edges'];
}

export interface RowProps {
    columns: TableColumns[];
    row: Alert;
    hideEntityName?: boolean;
    hideResolvedAt?: boolean;
}

export interface DetailsPaneProps {
    alertDetails: any;
}
