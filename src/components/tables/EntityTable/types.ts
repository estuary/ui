import type { ReactNode } from 'react';
import type { SelectTableStoreNames } from 'src/stores/names';
import type { SortDirection, TableColumns } from 'src/types';

export interface ColumnProps extends TableColumns {
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
    renderFooHeader?: (index: number) => ReactNode;
}

export interface StandAloneTableTitleProps {
    titleIntlKey: string;
    docsUrl?: string;
    messageIntlKey?: string;
}

export interface EntityTableHeaderProps {
    columns: ColumnProps[];
    columnToSort?: string;
    disableBackground?: boolean; // Not common and only for bindings selector right now (Q2 2025)
    enableDivRendering?: boolean;
    headerClick?: (column: any) => (event: React.MouseEvent<unknown>) => void;
    height?: number;
    hide?: boolean;
    selectData?: any;
    selectableTableStoreName?: SelectTableStoreNames;
    sortDirection?: SortDirection;
}
