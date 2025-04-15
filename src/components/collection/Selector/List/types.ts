import type { MutableRefObject } from 'react';
import type { FixedSizeList } from 'react-window';
import type {
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_STRIPPED_PATH_NAME,
} from 'src/components/collection/Selector/List/shared';
import type { BindingState } from 'src/stores/Binding/types';

export type CollectionNameKeys =
    | typeof COLLECTION_SELECTOR_NAME_COL
    | typeof COLLECTION_SELECTOR_STRIPPED_PATH_NAME;

export interface CollectionSelectorBodyProps {
    checkScrollbarVisibility: () => void;
    columns: any[];
    filterValue: string;
    rows: any[];
    scrollingElementCallback: (node?: any) => FixedSizeList | undefined;
    selectionEnabled: boolean;
    tableScroller: MutableRefObject<FixedSizeList | undefined>;
    setCurrentBinding?: BindingState['setCurrentBinding'];
}

export interface CollectionSelectorFooterProps {
    columnCount: number;
    filteredCount: number | undefined;
    totalCount: number;
}
