import { TABLES } from 'services/supabase';
import { useQuery, useSelectSingle } from './supabase-swr/';

export interface Publications {
    id: string;
    logs_token: string;
}

const PUBLICATION_COLS = ['id', 'logs_token'];

function usePublications(lastPubId: string | null) {
    const publicationsQuery = useQuery<Publications>(
        TABLES.PUBLICATIONS,
        {
            columns: PUBLICATION_COLS,
            filter: (query) => query.eq('id', lastPubId as string),
        },
        [lastPubId]
    );

    const { data, error } = useSelectSingle(
        lastPubId ? publicationsQuery : null
    );

    return {
        publications: data ? data.data : null,
        error,
    };
}

export default usePublications;
