import type {
    AffectedMaterialization,
    IncompatibleCollections,
    RequiresRecreation,
} from 'src/api/evolutions';

export interface CollectionActionProps {
    incompatibleCollection: IncompatibleCollections;
}

export interface DescriptionProps {
    newName: string | null;
    recreateCause: RequiresRecreation | null;
    affectedMaterializations?: AffectedMaterialization[];
}
