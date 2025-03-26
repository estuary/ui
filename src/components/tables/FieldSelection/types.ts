import { CompositeProjection } from 'components/editor/Bindings/FieldSelection/types';
import { SortDirection, TableColumns } from 'types';

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
