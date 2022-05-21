import { callSupabase, DEFAULT_FILTER, TABLES } from 'services/supabase';

export const createPublication = (
    draftId: string | null,
    entityDescription?: string
) => {
    return callSupabase(TABLES.PUBLICATIONS, [
        {
            draft_id: draftId ?? DEFAULT_FILTER,
            dry_run: false,
            detail: entityDescription ?? null,
        },
    ]);
};
