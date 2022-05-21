import { PostgrestError } from '@supabase/postgrest-js';
import { DEFAULT_FILTER, supabaseClient, TABLES } from 'services/supabase';

interface CreatePublication {
    error?: PostgrestError;
    data: any;
}

export const createPublication = (
    draftId: string | null,
    entityDescription?: string
): PromiseLike<CreatePublication> => {
    const query = supabaseClient.from(TABLES.PUBLICATIONS);

    const callPublications = () => {
        return query
            .insert([
                {
                    draft_id: draftId ?? DEFAULT_FILTER,
                    dry_run: false,
                    detail: entityDescription ?? null,
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

    return callPublications();
};
