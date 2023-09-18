import { Entity } from 'types';

export interface TableHydratorProps {
    entity: Entity;
    selectedCollections: string[];
}

export interface AddCollectionDialogCTAProps {
    toggle: (show: boolean) => void;
}
