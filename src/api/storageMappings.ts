import {
    defaultTableFilter,
    Pagination,
    SortingProps,
    supabaseClient,
} from 'services/supabase';

const getStorageMappings = (
    pagination: Pagination,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient.from('storage_mappings').select(
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
        .from('storage_mappings')
        .select(
            `    
            catalog_prefix,
            spec,
            updated_at
        `
        )
        .eq('catalog_prefix', catalog_prefix);

    return queryBuilder;
};

export { getStorageMappings, getStorageMapping };
