import { DEFAULT_FILTER, supabaseClient, TABLES } from 'services/supabase';
import { useQuery, useSelect } from './supabase-swr/';

export interface DraftSpecQuery {
    catalog_name: string;
    spec_type: string;
    spec: object;
    draft_id: string;
}

const DRAFT_SPEC_COLS = ['catalog_name', 'spec_type', 'spec', 'draft_id'];
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

    const { data, error, mutate, isValidating } = useSelect(
        draftId ? draftSpecQuery : null
    );

    return {
        draftSpecs: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export function updateDraftSpec(
    catalogName: string,
    id: string | null,
    spec: any,
    mutate?: any
) {
    const updatedPromise = supabaseClient
        .from(TABLES.DRAFT_SPECS)
        .update({ spec })
        .match({
            draft_id: id ?? DEFAULT_FILTER,
            catalog_name: catalogName,
        })
        .then(
            () => {},
            () => {}
        );

    if (mutate) {
        mutate()
            .then(() => {})
            .catch(() => {});
    }

    return updatedPromise;
}

export default useDraftSpecs;
