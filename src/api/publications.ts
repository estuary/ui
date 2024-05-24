import {
    DEFAULT_FILTER,
    insertSupabase,
    JOB_STATUS_COLUMNS,
    supabaseClient,
    TABLES,
} from 'services/supabase';

export const createPublication = (
    draftId: string | null,
    dryRun: boolean,
    entityDescription?: string
) => {
    return insertSupabase(TABLES.PUBLICATIONS, {
        draft_id: draftId ?? DEFAULT_FILTER,
        dry_run: dryRun,
        detail: entityDescription ?? null,
    });
};

export interface PublicationJobStatus {
    job_status: { type: string };
    logs_token: string;
    id: string;
}

export const getPublicationByIdQuery = (pubId: string, draftId?: string) => {
    let query = supabaseClient
        .from(TABLES.PUBLICATIONS)
        .select(JOB_STATUS_COLUMNS)
        .eq('id', pubId);

    if (draftId) {
        query = query.eq('draft_id', draftId);
    }

    return query;
};
