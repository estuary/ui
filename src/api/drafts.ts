import { PostgrestError } from '@supabase/postgrest-js';
import { supabaseClient, TABLES } from 'services/supabase';

interface CreateDraft {
    error?: PostgrestError;
    data: any;
}

export const createEntityDraft = (entityName: string): Promise<CreateDraft> => {
    return new Promise((resolve) => {
        supabaseClient
            .from(TABLES.DRAFTS)
            .insert({
                detail: entityName,
            })
            .then(
                (draftsResponse) => {
                    if (draftsResponse.data && draftsResponse.data.length > 0) {
                        resolve({
                            data: draftsResponse.data,
                        });
                    } else if (draftsResponse.error) {
                        const errorDetails = {
                            data: null,
                            error: draftsResponse.error,
                        };
                        resolve(errorDetails);
                    }
                },
                (error) => {
                    const errorDetails = {
                        data: null,
                        error,
                    };
                    resolve(errorDetails);
                }
            );
    });
};
