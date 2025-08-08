import type { ExpandedFieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { SortDirection, TableColumns } from 'src/types';

export interface RowProps {
    columns: TableColumns[];
    row: ExpandedFieldSelection;
}

export interface RowsProps {
    columnToSort: string;
    columns: TableColumns[];
    data: ExpandedFieldSelection[];
    sortDirection: SortDirection;
}

export interface FieldSelectionTableProps {
    bindingUUID: string;
    missingServerData: boolean;
}
