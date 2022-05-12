import { DEFAULT_FILTER, TABLES } from 'services/supabase';
import { useQuery, useSelect } from './supabase-swr/';

interface DraftErrorsQuery {
    scope: string;
    detail: string;
    draft_id: string;
}

const DRAFT_SPEC_COLS = ['scope', 'detail', 'draft_id'];

function useDraftSpecErrors(draftId?: string | null) {
    const draftErrorsQuery = useQuery<DraftErrorsQuery>(
        TABLES.DRAFT_ERRORS,
        {
            columns: DRAFT_SPEC_COLS,
            filter: (query) => query.eq('draft_id', draftId ?? DEFAULT_FILTER),
        },
        [draftId]
    );

    const { data, error, mutate, isValidating } = useSelect(
        draftId ? draftErrorsQuery : null
    );

    return {
        draftSpecErrors: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export default useDraftSpecErrors;
