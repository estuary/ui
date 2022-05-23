import { insertSupabase, TABLES } from 'services/supabase';

export const createEntityDraft = (entityName: string) => {
    return insertSupabase(TABLES.DRAFTS, {
        detail: entityName,
    });
};
