import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { supabaseClient } from 'context/Supabase';
import {
    defaultTableFilter,
    Pagination,
    RPCS,
    SortingProps,
    supabaseRetry,
    TABLES,
} from 'services/supabase';
import { StorageMappings } from 'types';

const getStorageMappings = (
    catalogPrefix: string,
    pagination: Pagination,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    // TODO (storage mappings) including count will make pagination work but
    //  it makes this table take around 3.3 SECONDS in production.
    return defaultTableFilter<StorageMappings[]>(
        supabaseClient
            .from(TABLES.STORAGE_MAPPINGS)
            .select(
                `
            id,
            spec,
            catalog_prefix,
            updated_at
        `
            )
            .eq('catalog_prefix', catalogPrefix),
        [],
        searchQuery,
        sorting,
        pagination
    );
};

const getStorageMapping = (catalog_prefix: string) => {
    return supabaseClient
        .from(TABLES.STORAGE_MAPPINGS)
        .select(
            `    
            spec,
            catalog_prefix,
            updated_at
        `
        )
        .eq('catalog_prefix', catalog_prefix)
        .returns<StorageMappings[]>();
};

const republishPrefix = async (prefix: string) => {
    return supabaseRetry<PostgrestSingleResponse<string>>(
        () =>
            supabaseClient.rpc(RPCS.REPUBLISH_PREFIX, {
                prefix,
            }),
        'republishPrefix'
    );
};

export { getStorageMapping, getStorageMappings, republishPrefix };
