import { deleteSupabase, insertSupabase, TABLES } from 'services/supabase';

export const createEntityDraft = (entityName: string) => {
    return insertSupabase(TABLES.DRAFTS, {
        detail: entityName,
    });
};

export const deleteEntityDraft = (draftId: string) => {
    return deleteSupabase(TABLES.DRAFTS, { id: draftId });
};
