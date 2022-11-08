import { SelectTableStoreNames } from 'stores/names';

export interface DisableEnableButtonProps {
    enabling: boolean;
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.MATERIALIZATION;
}
