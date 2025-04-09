import type { GridRenderCellParams, GridRowId } from '@mui/x-data-grid';
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

export interface CollectionSelectorListProps {
    disableActions?: boolean;
    renderers: {
        cell: {
            name: CollectionSelectorCellRenderer;
            remove?: CollectionSelectorCellRenderer;
            toggle?: CollectionSelectorCellRenderer;
        };
    };
    header?: string;
    height?: number | string;
    removeCollections?: (rows: GridRowId[]) => void;
    toggleCollections?: (rows: GridRowId[] | null, value: boolean) => Number;
    setCurrentBinding?: BindingState['setCurrentBinding'];
}
