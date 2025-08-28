import type { TablePrefixes } from 'src/stores/Tables/hooks';
import type { TableColumns } from 'src/types';
import type {
    Alert,
    AlertHistoryQueryResponse,
    AlertsVariables,
} from 'src/types/gql';
import type { UseQueryArgs } from 'urql';

export interface AlertHistoryTableProps {
    querySettings: UseQueryArgs<AlertsVariables, AlertHistoryQueryResponse>;
    tablePrefix:
        | TablePrefixes.alertHistoryForEntity
        | TablePrefixes.alertHistoryForTenant;
    getDataFromResponse?: (foo: unknown) => AlertHistoryQueryResponse;
}

export interface ActiveAlertsProps {}

export interface RowsProps {
    columns: TableColumns[];
    data: AlertHistoryQueryResponse['alerts'];
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
