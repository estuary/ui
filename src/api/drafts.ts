import { supabaseUpsert, TABLES } from 'services/supabase';

export const createEntityDraft = (entityName: string) => {
    return supabaseUpsert(TABLES.DRAFTS, {
        detail: entityName,
    });
};
