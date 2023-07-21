import { StorageMappings } from 'types';

import {
    defaultTableFilter,
    Pagination,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';

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
