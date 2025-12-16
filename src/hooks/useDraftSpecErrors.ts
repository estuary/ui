import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { supabaseClient } from 'src/context/GlobalProviders';
import { DEFAULT_POLLING } from 'src/context/SWR';
import { TABLES } from 'src/services/supabase';

interface DraftErrorsQuery {
    scope: string;
    detail: string;
    draft_id: string;
}

const MAX_ERRORS_DISPLAYED = 10;
const DRAFT_SPEC_COLS = ['scope', 'detail', 'draft_id'].join(',');
const defaultResponse: DraftErrorsQuery[] = [];

function useDraftSpecErrors(
    draftId?: string | null,
    enablePolling?: boolean,
    maxErrors?: number
) {
    const { data, count, error, mutate, isValidating } = useQuery(
        draftId
            ? supabaseClient
                  .from(TABLES.DRAFT_ERRORS)
                  .select(DRAFT_SPEC_COLS, { count: 'exact' })
                  .eq('draft_id', draftId)
                  .limit(maxErrors ?? MAX_ERRORS_DISPLAYED)
                  .returns<DraftErrorsQuery[]>()
            : null,
        {
            refreshInterval: enablePolling ? DEFAULT_POLLING : undefined,
        }
    );

    return {
        draftSpecErrors: data ?? defaultResponse,
        count: count ?? null,
        error,
        mutate,
        isValidating,
    };
}

export default useDraftSpecErrors;
