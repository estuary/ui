import { TABLES } from 'services/supabase';
import { useQuery, useSelect } from './supabase-swr/';

interface DraftSpecQuery {
    catalog_name: string;
    spec_type: string;
    spec_patch: object;
    draft_id: string;
}

const DRAFT_SPEC_COLS = ['catalog_name', 'spec_type', 'spec_patch', 'draft_id'];
const DRAFT_SPEC_QUERY = DRAFT_SPEC_COLS.join(', ');

function useDraftSpecs(draftId: string | null) {
    const draftSpecQuery = useQuery<DraftSpecQuery>(
        TABLES.DRAFT_SPECS,
        {
            columns: DRAFT_SPEC_QUERY,
            filter: (query) => query.eq('draft_id', draftId as string),
        },
        [draftId]
    );

    const { data, error, mutate } = useSelect(
        draftId ? draftSpecQuery : null,
        {}
    );

    return {
        draftSpecs: data ? data.data : [],
        error,
        mutate,
    };
}

export default useDraftSpecs;
