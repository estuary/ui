import {
    defaultTableFilter,
    Pagination,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { StorageMappings } from 'types';

const getStorageMappings = (
    catalogPrefix: string,
    pagination: Pagination,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<StorageMappings>(TABLES.STORAGE_MAPPINGS)
        .select(
            `
            id,
            spec,
            catalog_prefix,
            updated_at
        `
            // TODO (storage mappings) including count will make pagination work but
            //  it makes this table take around 3.3 SECONDS in production.
            // { count: 'exact' }
        )
        .eq('catalog_prefix', catalogPrefix);

    queryBuilder = defaultTableFilter(
        queryBuilder,
        [],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

const getStorageMapping = (catalog_prefix: string) => {
    const queryBuilder = supabaseClient
        .from<StorageMappings>(TABLES.STORAGE_MAPPINGS)
        .select(
            `    
            spec,
            catalog_prefix,
            updated_at
        `
        )
        .eq('catalog_prefix', catalog_prefix);

    return queryBuilder;
};

export { getStorageMapping, getStorageMappings };
