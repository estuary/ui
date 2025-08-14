import type { TablePrefixes } from 'src/stores/Tables/hooks';
import type { TableColumns } from 'src/types';
import type { AlertHistoryQueryResponse, AlertsVariables } from 'src/types/gql';
import type { UseQueryArgs } from 'urql';

export interface AlertHistoryTableProps {
    querySettings: UseQueryArgs<AlertsVariables, AlertHistoryQueryResponse>;
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
