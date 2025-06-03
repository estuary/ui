import type { TablePrefix } from 'src/stores/Tables/hooks';

export interface TableColumnSelectorProps {
    optionalColumns: string[];
    tablePrefix: TablePrefix;
    loading?: boolean;
}
