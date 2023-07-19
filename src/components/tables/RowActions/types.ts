import { SelectTableStoreNames } from 'stores/names';

export interface RowSelectorProps {
    hideActions?: boolean;
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.MATERIALIZATION;
    showMaterialize?: boolean;
}
