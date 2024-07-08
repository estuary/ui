import { supabaseClient } from 'context/Supabase';
import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'services/supabase';
import { InferredSchemas } from 'types';

export const fetchInferredSchema = (collectionName: string) => {
    const queryBuilder = supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.INFERRED_SCHEMAS)
                .select(`schema`)
                .eq('collection_name', collectionName)
                .returns<InferredSchemas[]>(),
        'fetchInferredSchema'
    ).then(handleSuccess<Pick<InferredSchemas, 'schema'>[]>, handleFailure);

    return queryBuilder;
};
