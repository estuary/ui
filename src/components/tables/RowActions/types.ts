import { SelectTableStoreNames } from 'stores/names';

export interface RowSelectorProps {
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.MATERIALIZATION;
    showMaterialize?: boolean;
}
