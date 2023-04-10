// {"multi_use": true, "valid_for": "10 days"}

import { RPCS, supabaseClient } from 'services/supabase';

export const createRefreshToken = async (
    multi_use: boolean,
    valid_for: string
) => {
    return supabaseClient
        .rpc<{ id: string; secret: string }>(RPCS.CREATE_REFRESH_TOKEN, {
            multi_use,
            valid_for,
        })
        .throwOnError()
        .single();
};
