import { Auth } from '@supabase/ui';

import { TABLES } from 'services/supabase';

import { useQuery, useSelect } from './supabase-swr';

export interface DraftQuery {
    id: string;
    detail: string;
    updated_at: string;
    user_id: string;
}

const DRAFT_COLS = ['id', 'detail', 'updated_at', 'user_id'];
const defaultResponse: DraftQuery[] = [];

function useDraft(catalogName: string | null) {
    const { user } = Auth.useUser();

    const draftQuery = useQuery<DraftQuery>(
        TABLES.DRAFTS_EXT,
        {
            columns: DRAFT_COLS,
            filter: (query) =>
                user
                    ? query
                          .eq('detail', catalogName as string)
                          .eq('user_id', user.id)
                          .order('updated_at', { ascending: false })
                    : query
                          .eq('detail', catalogName as string)
                          .order('updated_at', { ascending: false }),
        },
        [catalogName]
    );

    const { data, error, mutate, isValidating } = useSelect(
        catalogName && user ? draftQuery : null
    );

    return {
        drafts: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useDraft;
