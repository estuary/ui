import { TABLES } from 'services/supabase';
import { getSWRConfig } from 'utils/misc-utils';
import { useQuery, useSelect } from './supabase-swr/';

interface DraftErrorsQuery {
    scope: string;
    detail: string;
    draft_id: string;
}

const DRAFT_SPEC_COLS = ['scope', 'detail', 'draft_id'];

function useDraftSpecErrors(draftId?: string | null, enablePolling?: boolean) {
    const draftErrorsQuery = useQuery<DraftErrorsQuery>(
        TABLES.DRAFT_ERRORS,
        {
            columns: DRAFT_SPEC_COLS,
            filter: (query) => query.eq('draft_id', draftId as string),
        },
        [draftId]
    );

    const options = getSWRConfig(enablePolling);

    const { data, error, mutate, isValidating } = useSelect(
        draftId ? draftErrorsQuery : null,
        options
    );

    return {
        draftSpecErrors: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export default useDraftSpecErrors;
