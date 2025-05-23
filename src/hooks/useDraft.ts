import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { supabaseClient } from 'src/context/GlobalProviders';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { TABLES } from 'src/services/supabase';

export interface DraftQuery {
    id: string;
    detail: string;
    updated_at: string;
    user_id: string;
}

const DRAFT_COLS = ['id', 'detail', 'updated_at', 'user_id'].join(',');
const defaultResponse: DraftQuery[] = [];

function useDraft(catalogName: string | null) {
    const user = useUserStore((state) => state.user);

    const { data, error, mutate, isValidating } = useQuery(
        catalogName && user?.id
            ? supabaseClient
                  .from(TABLES.DRAFTS_EXT)
                  .select(DRAFT_COLS)
                  .eq('detail', catalogName)
                  .eq('user_id', user.id)
                  .order('updated_at', { ascending: false })
                  .returns<DraftQuery[]>()
            : null
    );

    return {
        drafts: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useDraft;
