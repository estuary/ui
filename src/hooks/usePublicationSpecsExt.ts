import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getPublicationHistoryByCatalogName } from 'api/publicationSpecsExt';

function usePublicationSpecsExt_History(catalogName?: string) {
    const { data, error, mutate, isValidating } = useQuery(
        catalogName ? getPublicationHistoryByCatalogName(catalogName) : null
    );

    return {
        publications: data ?? null,
        error,
        mutate,
        isValidating,
    };
}

export default usePublicationSpecsExt_History;
