import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useUser } from 'context/UserContext';
import { supabaseClient, TABLES } from 'services/supabase';

export interface DraftQuery {
    id: string;
    detail: string;
    updated_at: string;
    user_id: string;
}

const DRAFT_COLS = ['id', 'detail', 'updated_at', 'user_id'].join(',');
const defaultResponse: DraftQuery[] = [];

function useDraft(catalogName: string | null) {
    const { session } = useUser();

    const { data, error, mutate, isValidating } = useQuery(
        catalogName && session?.user.id
            ? supabaseClient
                  .from(TABLES.DRAFTS_EXT)
                  .select(DRAFT_COLS)
                  .eq('detail', catalogName)
                  .eq('user_id', session.user.id)
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
