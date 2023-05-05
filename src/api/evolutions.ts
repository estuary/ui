import { DEFAULT_FILTER, insertSupabase, TABLES } from 'services/supabase';
import { incrementCollectionNames } from 'utils/name-utils';

export const createEvolution = (draftId: string | null, collections: any[]) => {
    const foo = incrementCollectionNames(collections);

    console.log('foo', foo);

    return insertSupabase(TABLES.EVOLUTIONS, {
        draft_id: draftId ?? DEFAULT_FILTER,
        collections,
    });
};
