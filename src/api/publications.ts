import { supabaseClient } from 'context/GlobalProviders';
import {
    DEFAULT_FILTER,
    insertSupabase,
    JOB_STATUS_COLUMNS,
    TABLES,
} from 'services/supabase';
import { hasLength } from 'utils/misc-utils';

interface PublicationRequest {
    draft_id: string;
    dry_run: boolean;
    data_plane_name?: string;
    detail?: string | null;
}

export const createPublication = (
    draftId: string | null,
    dryRun: boolean,
    entityDescription?: string,
    dataPlaneName?: string
) => {
    const data: PublicationRequest = {
        draft_id: draftId ?? DEFAULT_FILTER,
        dry_run: dryRun,
        detail: entityDescription ?? null,
    };

    if (hasLength(dataPlaneName)) {
        data.data_plane_name = dataPlaneName;
    }

    return insertSupabase(TABLES.PUBLICATIONS, data);
};

export interface PublicationJobStatus {
    job_status: { type: string };
    logs_token: string;
    id: string;
}

export const getPublicationByIdQuery = (pubId: string) => {
    return supabaseClient
        .from(TABLES.PUBLICATIONS)
        .select(JOB_STATUS_COLUMNS)
        .eq('id', pubId);
};
