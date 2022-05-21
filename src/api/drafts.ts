import { callSupabase, TABLES } from 'services/supabase';

export const createEntityDraft = (entityName: string) => {
    return callSupabase(TABLES.DRAFTS, {
        detail: entityName,
    });
};
