import { useUser } from 'context/UserContext';
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
    const { session } = useUser();

    const draftQuery = useQuery<DraftQuery>(
        TABLES.DRAFTS_EXT,
        {
            columns: DRAFT_COLS,
            filter: (query) =>
                query
                    .eq('detail', catalogName as string)
                    // @ts-expect-error We check for the session.userid down below and if it is missing the query is not called
                    .eq('user_id', session.user.id)
                    .order('updated_at', { ascending: false }),
        },
        [catalogName]
    );

    const { data, error, mutate, isValidating } = useSelect(
        catalogName && session?.user?.id ? draftQuery : null
    );

    return {
        drafts: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useDraft;
