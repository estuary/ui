import { SelectTableStoreNames } from 'stores/names';
import { Entity } from 'types';

export interface TableHydratorProps {
    entity?: Entity;
    selectedCollections: string[];
    storeName: SelectTableStoreNames;
}

export interface AddCollectionDialogCTAProps {
    entity?: Entity;
    toggle: (show: boolean) => void;
}
