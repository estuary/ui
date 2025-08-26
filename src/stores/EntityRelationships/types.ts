import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { BaseComponentProps } from 'src/types';

export interface EntityRelationshipsState extends StoreWithHydration {
    captures: string[] | null;
    setCaptures: (newVal: EntityRelationshipsState['captures']) => void;

    materializations: string[] | null;
    setMaterializations: (
        newVal: EntityRelationshipsState['materializations']
    ) => void;

    collections: string[] | null;
    setCollections: (newVal: EntityRelationshipsState['collections']) => void;

    resetState: () => void;
}

export interface HydratorProps extends BaseComponentProps {
    catalogName: string;
    lastChecked: string;
}
