import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { InferredSchemas } from 'types';

export const fetchInferredSchema = (collectionName: string) => {
    const queryBuilder = supabaseClient
        .from<InferredSchemas>(TABLES.INFERRED_SCHEMAS)
        .select(`schema`)
        .eq('collection_name', collectionName)
        .then(handleSuccess<Pick<InferredSchemas, 'schema'>[]>, handleFailure);

    return queryBuilder;
};
