import type { TablePrefixes } from 'src/stores/Tables/hooks';
import type { TableColumns } from 'src/types';

export interface AlertHistoryTableProps {
    querySettings: any;
    tablePrefix:
        | TablePrefixes.alertHistoryForEntity
        | TablePrefixes.alertHistoryForTenant;
}

export interface RowsProps {
    columns: TableColumns[];
    data: any;
}

export interface RowProps {
    columns: TableColumns[];
    row: any;
    hideEntityName?: boolean;
}

export interface DetailsPaneProps {
    foo: any;
}
