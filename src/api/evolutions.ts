import { DEFAULT_FILTER, insertSupabase, TABLES } from 'services/supabase';
import { incrementCollectionNames } from 'utils/name-utils';

// Evolution starts by returning the key `incompatible_collections`
export interface IncompatibleCollections {
    collection: string;
    affected_materializations: {
        name: string;
        fields: {
            field: string;
            reason: string;
        }[];
    }[];
}

export const createEvolution = (
    draftId: string | null,
    collectionNames: string[]
) => {
    const collections = incrementCollectionNames(collectionNames);

    return insertSupabase(TABLES.EVOLUTIONS, {
        draft_id: draftId ?? DEFAULT_FILTER,
        collections,
    });
};
