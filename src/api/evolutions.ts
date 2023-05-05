import { DEFAULT_FILTER, insertSupabase, TABLES } from 'services/supabase';
import { incrementCollectionNames } from 'utils/name-utils';

export const createEvolution = (draftId: string | null, collections: any[]) => {
    const updatedCollectionNames = incrementCollectionNames(collections);

    console.log('object', updatedCollectionNames);

    return insertSupabase(TABLES.EVOLUTIONS, {
        draft_id: draftId ?? DEFAULT_FILTER,
        collections,
    });
};
