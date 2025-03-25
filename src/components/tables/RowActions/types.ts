import type { SelectTableStoreNames } from 'stores/names';
import type { ReactNode } from 'react';

export interface RowConfirmation<M = string> {
    id: string;
    message: M;
}

export type RowActionSupportedTableStoreName =
    | SelectTableStoreNames.CAPTURE
    | SelectTableStoreNames.COLLECTION
    | SelectTableStoreNames.ENTITY_SELECTOR
    | SelectTableStoreNames.MATERIALIZATION;

export interface RowSelectorProps {
    hideActions?: boolean;
    selectKeyValueName?: string;
    selectableTableStoreName?: RowActionSupportedTableStoreName;
    showMaterialize?: boolean;
    showSelectedCount?: boolean;
    showTransform?: boolean;
}

export interface DeleteButtonProps {
    selectableTableStoreName: RowActionSupportedTableStoreName;
}

export interface ProgressDialogProps {
    selectedEntities: any[];
    renderComponent: (
        item: any,
        index: number,
        onFinish: (response: any) => void
    ) => ReactNode;
    finished: Function;
}
