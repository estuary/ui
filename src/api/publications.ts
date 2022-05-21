import { DEFAULT_FILTER, supabaseUpsert, TABLES } from 'services/supabase';

export const createPublication = (
    draftId: string | null,
    entityDescription?: string
) => {
    return supabaseUpsert(TABLES.PUBLICATIONS, [
        {
            draft_id: draftId ?? DEFAULT_FILTER,
            dry_run: false,
            detail: entityDescription ?? null,
        },
    ]);
};
