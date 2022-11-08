import { SelectTableStoreNames } from 'stores/names';

export interface RowSelectorProps {
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.MATERIALIZATION;
    showMaterialize?: boolean;
}
