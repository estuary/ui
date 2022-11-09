import { TABLES } from 'services/supabase';
import { CatalogStats } from 'types';
import { useQuery, useSelectSingle } from './supabase-swr';

function useCatalogStats(name: string) {
    const query = useQuery<CatalogStats>(
        TABLES.CATALOG_STATS,
        {
            columns: `*`,
            filter: (filterBuilder) => filterBuilder.eq('catalog_name', name),
        },
        [name]
    );

    const { data, error, isValidating } = useSelectSingle(name ? query : null);

    return {
        stats: data ? data.data : null,
        isValidating,
        error,
    };
}

export default useCatalogStats;
