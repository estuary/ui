import type { MutableRefObject, ReactNode } from 'react';
import type { FixedSizeList } from 'react-window';
import type {
    COLLECTION_SELECTOR_NAME_COL,
    COLLECTION_SELECTOR_STRIPPED_PATH_NAME,
    COLLECTION_SELECTOR_TOGGLE_COL,
    COLLECTION_SELECTOR_UUID_COL,
} from 'src/components/collection/Selector/List/shared';
import type { AddDialogProps } from 'src/components/shared/Entity/AddDialog/types';
import type { ColumnProps } from 'src/components/tables/EntityTable/types';
import type { BindingState } from 'src/stores/Binding/types';

export type CollectionSelectorCellRenderer = (
    params: any,
    filterValue?: string
) => ReactNode;

export type CollectionNameKey =
    | typeof COLLECTION_SELECTOR_NAME_COL
    | typeof COLLECTION_SELECTOR_STRIPPED_PATH_NAME;

export type CollectionSelectorStringKey =
    | CollectionNameKey
    | typeof COLLECTION_SELECTOR_UUID_COL;

export type CollectionSelectorBooleanKey =
    | CollectionNameKey
    | typeof COLLECTION_SELECTOR_TOGGLE_COL;

export type CollectionSelectorMappedResourceConfig = {
    [key in CollectionSelectorStringKey]: string;
} & {
    [key in Exclude<
        CollectionSelectorBooleanKey,
        CollectionSelectorStringKey
    >]: boolean;
};

export interface BindingsEditorAddProps {
    selectedCollections: string[];
    AddSelectedButton: AddDialogProps['PrimaryCTA'];
    disabled?: boolean;
}

export interface CollectionSelectorColumnProps {
    renderCell?: CollectionSelectorCellRenderer;
    renderInlineHeader?: (index: number) => ReactNode;
    preventSelect?: boolean;
}

export interface CollectionSelectorHeaderProps {
    disableBackground?: boolean;
}

export interface CollectionSelectorProps {
    selectedCollections: string[];
    AddSelectedButton: AddDialogProps['PrimaryCTA'];
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

export interface CollectionSelectorCell {
    handler?: (rows: any, newVal?: any) => void;
    cellRenderer: CollectionSelectorCellRenderer;
}

export interface CollectionSelectorCellSettings {
    name: CollectionSelectorCell;
    remove?: CollectionSelectorCell;
    toggle?: CollectionSelectorCell;
}

export interface CollectionSelectorListProps {
    height: number; // Remove once FF can handle settings heights right https://bugzilla.mozilla.org/show_bug.cgi?id=1904559
    disableActions?: boolean;
    header?: string;
    hideFooter?: boolean;
    setCurrentBinding?: BindingState['setCurrentBinding'];
}

export interface CollectionSelectorBodyProps {
    checkScrollbarVisibility: () => void;
    columns: ColumnProps[];
    filterValue: string;
    height: number;
    rows: CollectionSelectorMappedResourceConfig[];
    scrollingElementCallback: (node?: any) => FixedSizeList | undefined;
    selectionEnabled: boolean;
    tableScroller: MutableRefObject<FixedSizeList | undefined>;
    setCurrentBinding?: BindingState['setCurrentBinding'];
}

export interface CollectionSelectorFooterProps {
    columnCount: number;
    totalCount: number;
    hideFooter?: boolean;
}
