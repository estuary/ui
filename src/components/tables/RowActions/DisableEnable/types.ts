import type { SelectTableStoreNames } from 'stores/names';

export interface DisableEnableButtonProps {
    enabling: boolean;
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION // never tested
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
}
