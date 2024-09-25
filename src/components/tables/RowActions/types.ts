import { SelectTableStoreNames } from 'stores/names';

export interface RowSelectorProps {
    hideActions?: boolean;
    selectKeyValueName?: string;
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    showMaterialize?: boolean;
    showSelectedCount?: boolean;
    showTransform?: boolean;
}
