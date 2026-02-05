import type { PostgrestSingleResponse } from '@supabase/postgrest-js';
import type { Pagination, SortingProps } from 'src/services/supabase';
import type { StorageMappingsQuery } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    RPCS,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';

const getStorageMappings = (
    catalogPrefix: string,
    pagination: Pagination,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    // TODO (storage mappings) including count will make pagination work but
    //  it makes this table take around 3.3 SECONDS in production.
    return defaultTableFilter<StorageMappingsQuery>(
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
            .like('catalog_prefix', `${catalogPrefix}%`),
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
        .returns<StorageMappingsQuery[]>();
};

const getAllStorageMappingStores = async () => {
    return supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.STORAGE_MAPPINGS)
                .select('catalog_prefix,spec'),
        'getAllStorageMappingStores'
    ).then(
        handleSuccess<Pick<StorageMappingsQuery, 'catalog_prefix' | 'spec'>[]>,
        handleFailure
    );
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
        handleSuccess<Pick<StorageMappingsQuery, 'catalog_prefix' | 'spec'>[]>,
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
    getAllStorageMappingStores,
    getStorageMapping,
    getStorageMappingStores,
    getStorageMappings,
    republishPrefix,
};
