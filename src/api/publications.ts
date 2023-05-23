import { DEFAULT_FILTER, insertSupabase } from 'services/supabase';

export const createPublication = (
    draftId: string | null,
    dryRun: boolean,
    entityDescription?: string
) => {
    return insertSupabase('publications', {
        draft_id: draftId ?? DEFAULT_FILTER,
        dry_run: dryRun,
        detail: entityDescription ?? null,
    });
};
