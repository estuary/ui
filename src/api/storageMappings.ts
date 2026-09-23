import type { PostgrestSingleResponse } from '@supabase/postgrest-js';
import type { StorageMappingsQuery } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    handleFailure,
    handleSuccess,
    RPCS,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';

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
    republishPrefix,
};
