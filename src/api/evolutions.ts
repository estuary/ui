import { DEFAULT_FILTER, insertSupabase, TABLES } from 'services/supabase';

export const createEvolution = (draftId: string | null, collections: any[]) => {
    return insertSupabase(TABLES.EVOLUTIONS, {
        draft_id: draftId ?? DEFAULT_FILTER,
        collections,
    });
};
