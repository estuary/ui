import { SelectTableStoreNames } from 'stores/names';

export interface RowSelectorProps {
    hideActions?: boolean;
    selectKeyValueName?: string;
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.COLLECTION_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    showMaterialize?: boolean;
}
