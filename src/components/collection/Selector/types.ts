import type { GridRenderCellParams } from '@mui/x-data-grid';
import type { ReactNode } from 'react';
import type { AddDialogProps } from 'src/components/shared/Entity/AddDialog/types';
import type { BindingState } from 'src/stores/Binding/types';

export interface CollectionSelectorProps {
    selectedCollections: string[];
    AddSelectedButton: AddDialogProps['PrimaryCTA'];
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

export interface BindingsEditorAddProps {
    selectedCollections: string[];
    AddSelectedButton: AddDialogProps['PrimaryCTA'];
    disabled?: boolean;
}

export type CollectionSelectorCellRenderer = (
    params: GridRenderCellParams,
    filterValue?: string
) => ReactNode;

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
    disableActions?: boolean;
    header?: string;
    setCurrentBinding?: BindingState['setCurrentBinding'];
}
