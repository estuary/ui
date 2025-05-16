import type { FieldFilter } from 'src/components/schema/types';
import type {
    InferSchemaResponseProperty,
    Schema,
    SortDirection,
} from 'src/types';

export interface RowProps {
    row: InferSchemaResponseProperty;
}

export interface RowsProps {
    data: Schema | null;
    sortDirection: SortDirection;
    columnToSort: string;
}

export interface SchemaPropertiesTableProps {
    filter: FieldFilter;
}
