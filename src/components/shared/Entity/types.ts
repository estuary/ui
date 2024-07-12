import { Entity } from 'types';

export interface TableHydratorProps {
    disableQueryParamHack?: boolean;
    entity?: Entity;
    selectedCollections: string[];
}

export interface AddCollectionDialogCTAProps {
    entity?: Entity;
    toggle: (show: boolean) => void;
}
