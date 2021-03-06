import { TABLES } from 'services/supabase';
import { useQuery, useSelect } from './supabase-swr/';

export interface DraftSpecQuery {
    catalog_name: string;
    spec_type: string;
    spec: object;
    draft_id: string;
}

const DRAFT_SPEC_COLS = ['catalog_name', 'spec_type', 'spec', 'draft_id'];
const defaultResponse: DraftSpecQuery[] = [];

function useDraftSpecs(draftId: string | null) {
    const draftSpecQuery = useQuery<DraftSpecQuery>(
        TABLES.DRAFT_SPECS,
        {
            columns: DRAFT_SPEC_COLS,
            filter: (query) => query.eq('draft_id', draftId as string),
        },
        [draftId]
    );

    const { data, error, mutate, isValidating } = useSelect(
        draftId ? draftSpecQuery : null
    );

    return {
        draftSpecs: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useDraftSpecs;
