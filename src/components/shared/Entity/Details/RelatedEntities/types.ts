import type { Entity } from 'src/types';

export interface RelatedEntitiesBaseProps {
    entityType: Entity;
    newWindow?: boolean;
}

export type RelatedEntitiesProps =
    | (RelatedEntitiesBaseProps & {
          collectionId: string | null;
          preferredList?: never;
      })
    | (RelatedEntitiesBaseProps & {
          preferredList: string[] | null;
          collectionId?: never;
      });
