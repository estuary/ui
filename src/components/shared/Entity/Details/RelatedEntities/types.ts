import type { Entity } from 'src/types';

export interface RelatedEntitiesProps {
    entities: string[] | null;
    entityType: Entity;
    error?: boolean;
    newWindow?: boolean;
}
