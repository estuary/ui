import { PostgrestError } from '@supabase/postgrest-js';
import { supabaseClient, TABLES } from 'services/supabase';

interface CreateDraftSpec {
    error?: PostgrestError;
    data: any;
}

export const createDraftSpec = (
    draftId: string | null,
    catalogName: string,
    specType: 'materialization',
    draftSpec: any
): PromiseLike<CreateDraftSpec> => {
    const query = supabaseClient.from(TABLES.DRAFT_SPECS);

    const callDraftSpecs = () => {
        return query
            .insert([
                {
                    draft_id: draftId,
                    catalog_name: catalogName,
                    spec_type: specType,
                    spec: draftSpec,
                },
            ])
            .then(
                (response) => {
                    if (response.error) {
                        return {
                            data: null,
                            error: response.error,
                        };
                    } else {
                        return {
                            data: response.data,
                        };
                    }
                },
                (error) => {
                    return {
                        data: null,
                        error,
                    };
                }
            );
    };

    return callDraftSpecs();
};
