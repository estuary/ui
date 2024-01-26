import {
    defaultTableFilter,
    Pagination,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { StorageMappings } from 'types';

const getStorageMappings = (
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
            // TODO (storage mappins) including count will make pagination work but
            //  it makes this table take around 3.3 SECONDS in production.
            // { count: 'exact' }
        );

    queryBuilder = defaultTableFilter(
        queryBuilder,
        ['catalog_prefix'],
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

export { getStorageMappings, getStorageMapping };
