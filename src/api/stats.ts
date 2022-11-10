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
        .select('*')
        .in('catalog_name', names)
        .then(handleSuccess<CatalogStats[]>, handleFailure);
};

export { getStatsByName };
