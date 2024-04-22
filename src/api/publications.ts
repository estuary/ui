import {
    DEFAULT_FILTER,
    handleFailure,
    handleSuccess,
    insertSupabase,
    JOB_STATUS_COLUMNS,
    supabaseClient,
    supabaseRetry,
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

export const getPublicationById = async (pubId: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.PUBLICATIONS)
                .select(JOB_STATUS_COLUMNS)
                .eq('id', pubId),
        'getPublicationById'
    ).then(
        handleSuccess<
            {
                job_status: { type: string };
                logs_token: string;
                id: string;
            }[]
        >,
        handleFailure
    );

    return data;
};
