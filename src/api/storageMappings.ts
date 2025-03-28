import type { PostgrestSingleResponse } from '@supabase/postgrest-js';

import { supabaseClient } from 'src/context/GlobalProviders';
import type {
    Pagination,
    SortingProps} from 'src/services/supabase';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    RPCS,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';
import type { StorageMappings } from 'src/types';

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

const getStorageMappingStores = async (prefixes: string[]) => {
    return supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.STORAGE_MAPPINGS)
                .select('catalog_prefix,spec')
                .in('catalog_prefix', prefixes),
        'getStorageMappingStores'
    ).then(
        handleSuccess<Pick<StorageMappings, 'catalog_prefix' | 'spec'>[]>,
        handleFailure
    );
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

export {
    getStorageMapping,
    getStorageMappingStores,
    getStorageMappings,
    republishPrefix,
};
