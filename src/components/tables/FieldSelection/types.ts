import type { CompositeProjection } from 'src/components/fieldSelection/types';
import type { SortDirection, TableColumns } from 'src/types';

export interface RowProps {
    columns: TableColumns[];
    row: CompositeProjection;
}

export interface RowsProps {
    columnToSort: string;
    columns: TableColumns[];
    data: CompositeProjection[];
    sortDirection: SortDirection;
}

export interface FieldSelectionTableProps {
    bindingUUID: string;
    projections: CompositeProjection[] | null | undefined;
}
