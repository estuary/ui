import type {
    FieldSelection,
    GroupKeyMetadata,
} from 'src/stores/Binding/slices/FieldSelection';
import type { SortDirection, TableColumns } from 'src/types';

export interface RowProps {
    columns: TableColumns[];
    row: FieldSelection;
}

export interface RowsProps {
    columnToSort: string;
    columns: TableColumns[];
    data: FieldSelection[];
    groupBy: GroupKeyMetadata;
    sortDirection: SortDirection;
}

export interface FieldSelectionTableProps {
    bindingUUID: string;
    missingServerData: boolean;
}
