import type { ReactNode } from 'react';
import type {
    CollectionSelectorColumnProps,
    CollectionSelectorHeaderProps,
} from 'src/components/collection/Selector/types';
import type { Pagination } from 'src/services/supabase';
import type { SelectTableStoreNames } from 'src/stores/names';
import type {
    SortDirection,
    TableColumns,
    TableIntlConfig,
    TableState,
} from 'src/types';

// These are settings that were added just for Collection Selector but might be useful elsewhere in the future (Q2 2025)

export interface ColumnPropsBase
    extends TableColumns,
        CollectionSelectorColumnProps {}

export type ColumnProps =
    | (ColumnPropsBase & {
          renderHeader?: (
              index: number,
              storeName: SelectTableStoreNames
          ) => ReactNode;
          renderInlineHeader?: never;
      })
    | (ColumnPropsBase & {
          renderInlineHeader?: (index: number) => ReactNode;
          renderHeader?: never;
      });

export interface StandAloneTableTitleProps {
    titleIntlKey: string;
    docsUrl?: string;
    messageIntlKey?: string;
}

export interface EntityTableHeaderProps extends CollectionSelectorHeaderProps {
    columns: ColumnProps[];
    columnToSort?: string;
    enableDivRendering?: boolean;
    headerClick?: (column: any) => (event: React.MouseEvent<unknown>) => void;
    height?: number;
    hide?: boolean;
    selectData?: any;
    selectableTableStoreName?: SelectTableStoreNames;
    sortDirection?: SortDirection;
}

export interface EntityTableProps {
    columns: ColumnProps[];
    columnToSort: string;
    filterLabel: string;
    header: string | ReactNode | null;
    noExistingDataContentIds: TableIntlConfig;
    pagination: Pagination;
    renderTableRows: (data: any, showEntityStatus: boolean) => ReactNode;
    rowsPerPage: number;
    searchQuery: string | null;
    selectableTableStoreName: SelectTableStoreNames;
    setColumnToSort: (data: any) => void;
    setPagination: (data: any) => void;
    setRowsPerPage: (data: any) => void;
    setSearchQuery: (data: any) => void;
    setSortDirection: (data: any) => void;
    sortDirection: SortDirection;
    hideFilter?: boolean;
    hideHeaderAndFooter?: boolean;
    keepSelectionOnFilterOrSearch?: boolean;
    keepSelectionOnPagination?: boolean;
    minWidth?: number;
    rowsPerPageOptions?: number[];
    showEntityStatus?: boolean;
    showToolbar?: boolean;
    toolbar?: ReactNode;
    ExportComponent?: any;

    // This is a HACK
    tableAriaLabelKey?: string;
}

export interface EntityTableBodyProps {
    columns: ColumnProps[];
    noExistingDataContentIds: TableIntlConfig;
    tableState: TableState;
    loading: boolean;
    rows: any;
    enableDivRendering?: boolean;
}
