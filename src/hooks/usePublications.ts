import type { JobStatus } from 'src/types';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { supabaseClient } from 'src/context/GlobalProviders';
import { DEFAULT_POLLING } from 'src/context/SWR';
import { TABLES } from 'src/services/supabase';

export interface Publications {
    id: string;
    job_status: JobStatus;
    logs_token: string;
}

const PUBLICATION_COLS = ['id', 'job_status', 'logs_token'].join(',');

function usePublications(lastPubId: string | null, enablePolling?: boolean) {
    const { data, error } = useQuery(
        lastPubId
            ? supabaseClient
                  .from(TABLES.PUBLICATIONS)
                  .select(PUBLICATION_COLS)
                  .eq('id', lastPubId)
                  .single<Publications>()
            : null,
        {
            refreshInterval: enablePolling ? DEFAULT_POLLING : undefined,
        }
    );

    return {
        publication: data ?? null,
        error,
    };
}

export default usePublications;
