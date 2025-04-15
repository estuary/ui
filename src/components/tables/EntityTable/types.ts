import type { ReactNode } from 'react';
import type { CollectionSelectorCellRenderer } from 'src/components/collection/Selector/types';
import type { SelectTableStoreNames } from 'src/stores/names';
import type { SortDirection, TableColumns } from 'src/types';

// These are settings that were added just for Collection Selector but might be useful elsewhere in the future (Q2 2025)

export interface CollectionSelectorColumnProps {
    renderCell?: CollectionSelectorCellRenderer;
    renderInlineHeader?: (index: number) => ReactNode;
    preventSelect?: boolean;
}

export interface CollectionSelectorHeaderProps {
    disableBackground?: boolean;
}

export interface ColumnPropsBase
    extends TableColumns,
        CollectionSelectorColumnProps {
    // Common properties go here
}

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
