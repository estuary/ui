import { SWRConfiguration } from 'swr';
import { JobStatus } from 'types';

import { DEFAULT_POLLING } from 'context/SWR';

import { TABLES } from 'services/supabase';

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

    const options: SWRConfiguration = {
        refreshInterval: enablePolling ? DEFAULT_POLLING : undefined,
    };

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
