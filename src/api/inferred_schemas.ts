import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    supabaseRetry,
    TABLES,
} from 'services/supabase';
import { InferredSchemas } from 'types';

export const fetchInferredSchema = (collectionName: string) => {
    const queryBuilder = supabaseRetry(
        () =>
            supabaseClient
                .from<InferredSchemas>(TABLES.INFERRED_SCHEMAS)
                .select(`schema`)
                .eq('collection_name', collectionName),
        'fetchInferredSchema'
    ).then(handleSuccess<Pick<InferredSchemas, 'schema'>[]>, handleFailure);

    return queryBuilder;
};
