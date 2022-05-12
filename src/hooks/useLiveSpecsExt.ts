import { TABLES } from 'services/supabase';
import { useQuery, useSelectSingle } from './supabase-swr/';

export interface LiveSpecsExtQuery {
    id: string;
    writes_to: string[];
}

const queryColumns = ['id', 'writes_to'];

function useLiveSpecsExt(draftId: string | null) {
    const draftSpecQuery = useQuery<LiveSpecsExtQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            filter: draftId ? (query) => query.eq('id', draftId) : undefined,
        },
        [draftId]
    );

    const { data, error, mutate, isValidating } = useSelectSingle(
        draftId ? draftSpecQuery : null
    );

    return {
        liveSpecs: data
            ? data.data
            : {
                  draft_id: draftId ?? '',
                  writes_to: [],
              },
        error,
        mutate,
        isValidating,
    };
}

export default useLiveSpecsExt;
