import type { FieldFilter } from 'src/components/schema/types';
import type { Schema, SortDirection, TableColumns } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';

export interface RowProps {
    columns: TableColumns[];
    row: BuiltProjection;
}

export interface RowsProps {
    columns: TableColumns[];
    data: Schema | null;
    sortDirection: SortDirection;
    columnToSort: string;
}

export interface SchemaPropertiesTableProps {
    filter: FieldFilter;
}
