import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { CatalogStats } from 'types';

const getStatsByName = (names: string[]) => {
    console.log('getting stats by name');
    return supabaseClient
        .from<CatalogStats>(TABLES.CATALOG_STATS)
        .select(
            `    
            catalog_name,
            grain,
            bytes_written_by_me,
            docs_written_by_me,
            bytes_read_by_me,
            docs_read_by_me,
            bytes_written_to_me,
            docs_written_to_me,
            bytes_read_from_me,
            docs_read_from_me,
            ts
        `
        )
        .in('catalog_name', names)
        .order('ts')
        .order('catalog_name')
        .then(handleSuccess<CatalogStats[]>, handleFailure);
};

export { getStatsByName };
