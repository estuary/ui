import { Entity } from 'types';

export interface TableHydratorProps {
    entity?: Entity;
    selectedCollections: string[];
}

export interface AddCollectionDialogCTAProps {
    entity?: Entity;
    toggle: (show: boolean) => void;
}
