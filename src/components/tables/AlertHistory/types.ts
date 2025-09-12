import type { TablePrefixes } from 'src/stores/Tables/hooks';
import type { TableColumns } from 'src/types';
import type {
    Alert,
    AlertsVariables,
    ResolvedAlertsForTaskQuery,
} from 'src/types/gql';
import type { UseQueryArgs } from 'urql';

export interface AlertHistoryTableProps {
    querySettings: UseQueryArgs<AlertsVariables, ResolvedAlertsForTaskQuery>;
    tablePrefix: TablePrefixes.alertHistoryForEntity;
}

export interface ActiveAlertsProps {}

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
