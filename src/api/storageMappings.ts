import { supabaseClient, TABLES } from 'services/supabase';
import { StorageMappings } from 'types';

const getStorageMappings = () => {
    const queryBuilder = supabaseClient
        .from<StorageMappings>(TABLES.STORAGE_MAPPINGS)
        .select(
            `    
            spec,
            catalog_prefix,
            updated_at
        `
        );

    return queryBuilder;
};

export { getStorageMappings };
