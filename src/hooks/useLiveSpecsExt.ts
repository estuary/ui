import { TABLES } from 'services/supabase';
import { useQuery, useSelect } from './supabase-swr/';

export interface LiveSpecsExtQuery {
    id: string;
    writes_to: string[];
    spec_type: string;
    spec?: { [k: string]: any };
}

const queryColumns = ['id', 'writes_to', 'spec_type'];

function useLiveSpecsExt(
    draftId: string[] | string | null,
    includeSpec?: boolean
) {
    if (includeSpec) {
        queryColumns.push('spec');
    }

    const draftSpecQuery = useQuery<LiveSpecsExtQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            filter: draftId
                ? (query) => {
                      const draftArray =
                          typeof draftId === 'string' ? [draftId] : draftId;

                      return query
                          .eq('spec_type', 'capture')
                          .or(
                              `id.in.(${draftArray}),last_pub_id.in.(${draftArray})`
                          );
                  }
                : undefined,
        },
        [draftId]
    );

    const { data, error, mutate, isValidating } = useSelect(
        draftId ? draftSpecQuery : null
    );

    return {
        liveSpecs: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export default useLiveSpecsExt;
