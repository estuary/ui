import { TABLES } from 'services/supabase';
import { JobStatus } from 'types';
import { getSWRConfig } from 'utils/misc-utils';
import { useQuery, useSelectSingle } from './supabase-swr/';

export interface Publications {
    id: string;
    job_status: JobStatus;
    logs_token: string;
}

const PUBLICATION_COLS = ['id', 'job_status', 'logs_token'];

function usePublications(lastPubId: string | null, enablePolling?: boolean) {
    const publicationsQuery = useQuery<Publications>(
        TABLES.PUBLICATIONS,
        {
            columns: PUBLICATION_COLS,
            filter: (query) => query.eq('id', lastPubId as string),
        },
        [lastPubId]
    );

    const options = getSWRConfig(enablePolling);

    const { data, error } = useSelectSingle(
        lastPubId ? publicationsQuery : null,
        options
    );

    return {
        publication: data ? data.data : null,
        error,
    };
}

export default usePublications;
