import type { Entity } from 'src/types';

export interface RelatedEntitiesProps {
    collectionId: string | null;
    entityType: Entity;
    newWindow?: boolean;
    preferredList?: string[] | null;
}
