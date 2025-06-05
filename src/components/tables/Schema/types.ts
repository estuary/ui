import type { FieldFilter } from 'src/components/schema/types';
import type {
    InferSchemaResponseProperty,
    Schema,
    SortDirection,
    TableColumns,
} from 'src/types';

export interface RowProps {
    columns: TableColumns[];
    row: InferSchemaResponseProperty;
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
