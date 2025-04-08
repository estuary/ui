import type { InferredSchemas } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';

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
