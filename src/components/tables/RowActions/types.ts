import type { ReactNode } from 'react';
import type { CaptureQuery } from 'src/api/liveSpecsExt';
import type { SelectTableStoreNames } from 'src/stores/names';

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

export interface GroupedProgressDialogProps {
    selectedEntities: any[];
    renderComponent: (
        items: CaptureQuery[],
        onFinish: (response: any) => void
    ) => ReactNode;
    finished: Function;
}

export interface BaseConfirmationProps {
    count: number;
}

export interface DisableEnableConfirmationProps extends BaseConfirmationProps {
    enabling: boolean;
}

export interface DisableEnableButtonProps {
    enabling: boolean;
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION // never tested
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
}
