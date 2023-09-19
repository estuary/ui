import { SelectTableStoreNames } from 'stores/names';

export interface RowSelectorProps {
    hideActions?: boolean;
    disableMultiSelect?: boolean;
    selectKeyValueName?: string;
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.COLLECTION_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    showMaterialize?: boolean;
    showSelectedCount?: boolean;
}
