import type { TablePrefix } from 'src/stores/Tables/hooks';

export interface SelectColumnMenuProps {
    columns: string[];
    onChange: (
        event: React.SyntheticEvent<Element, Event>,
        checked: boolean,
        column: string
    ) => void;
    tablePrefix: TablePrefix;
    disabled?: boolean;
}

export interface TableColumnSelectorProps {
    optionalColumns: string[];
    tablePrefix: TablePrefix;
    loading?: boolean;
}
