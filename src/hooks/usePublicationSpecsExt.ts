import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import {
    getPublicationHistoryByCatalogName,
    getPublicationSpecByPublication,
} from 'src/api/publicationSpecsExt';

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

function usePublicationSpecsExt_DiffViewer(
    catalogName?: string,
    pubIds?: [string | null, string | null]
) {
    const { data, error, mutate, isValidating } = useQuery(
        catalogName &&
            pubIds &&
            (typeof pubIds[0] === 'string' || typeof pubIds[1] === 'string')
            ? getPublicationSpecByPublication(catalogName, pubIds)
            : null
    );

    return {
        publications: data ?? null,
        error,
        mutate,
        isValidating,
    };
}

export { usePublicationSpecsExt_History, usePublicationSpecsExt_DiffViewer };
