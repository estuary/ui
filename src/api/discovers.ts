import { PostgrestError } from '@supabase/postgrest-js';
import { supabaseClient, TABLES } from 'services/supabase';

interface CreateDraft {
    error?: PostgrestError;
    data: any;
}

export const discover = (
    entityName: string,
    config: any,
    connectorID: string,
    draftID: string
): PromiseLike<CreateDraft> => {
    const query = supabaseClient.from(TABLES.DISCOVERS);

    const callDiscover = () => {
        return query
            .insert([
                {
                    capture_name: entityName,
                    endpoint_config: config,
                    connector_tag_id: connectorID,
                    draft_id: draftID,
                },
            ])
            .then(
                (draftsResponse) => {
                    if (draftsResponse.error) {
                        return {
                            data: null,
                            error: draftsResponse.error,
                        };
                    } else {
                        return {
                            data: draftsResponse.data,
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

    return callDiscover();
};
