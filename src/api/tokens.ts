// {"multi_use": true, "valid_for": "10 days"}

import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { RPCS, supabaseClient, supabaseRetry } from 'services/supabase';

export const createRefreshToken = async (
    multi_use: boolean,
    valid_for: string
) => {
    return supabaseRetry<
        PostgrestSingleResponse<{ id: string; secret: string }>
    >(
        () =>
            supabaseClient
                .rpc(RPCS.CREATE_REFRESH_TOKEN, {
                    multi_use,
                    valid_for,
                })
                .single(),
        'createRefreshToken'
    );
};
