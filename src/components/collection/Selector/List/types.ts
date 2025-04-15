import type {
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_STRIPPED_PATH_NAME,
} from 'src/components/collection/Selector/List/shared';

export type CollectionNameKeys =
    | typeof COLLECTION_SELECTOR_NAME_COL
    | typeof COLLECTION_SELECTOR_STRIPPED_PATH_NAME;

export interface CollectionSelectorBodyProps {
    columns: any[];
    filterValue: string;
    rows: any[];
    selectionEnabled: boolean;
    setCurrentBinding?: any;
    tableScroller: any;
}

export interface CollectionSelectorFooterProps {
    columnCount: number;
    filteredCount?: number;
    totalCount: number;
}
